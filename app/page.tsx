import Link from "next/link";
import Image from "next/image";
import { getDatabase } from "@/lib/notion";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const revalidate = 3600; // revalidate every hour

async function getBlogPosts() {
  const databaseId = process.env.NOTION_DATABASE_ID;
  const posts = await getDatabase(databaseId!);
  return posts.map((post) => {
    const { properties } = post;
    return {
      id: post.id,
      title:
        properties.Title.type === "title"
          ? properties.Title.title[0].plain_text
          : "",
      slug:
        properties.Slug.type === "rich_text"
          ? properties.Slug.rich_text[0].plain_text
          : "",
      date: properties.Date.type === "date" ? properties.Date.date?.start : "",
      tags:
        properties.Tags.type === "multi_select"
          ? properties.Tags.multi_select.map((tag) => tag.name)
          : [],
      excerpt:
        properties.Excerpt.type === "rich_text"
          ? properties.Excerpt.rich_text[0].plain_text
          : "",
      image: properties.Image.type === "url" ? properties.Image.url : "",
    };
  });
}

export default async function Home() {
  const posts = await getBlogPosts();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">My Blog</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Card key={post.id}>
            <CardHeader>
              {post.image && (
                <Image
                  src={post.image}
                  alt={post.title}
                  width={400}
                  height={200}
                  className="rounded-t-lg object-cover h-48 w-full"
                />
              )}
            </CardHeader>
            <CardContent>
              <CardTitle className="mb-2">
                <Link href={`/posts/${post.slug}`} className="hover:underline">
                  {post.title}
                </Link>
              </CardTitle>
              <p className="text-sm text-gray-500 mb-2">
                {post.date
                  ? new Date(post.date).toLocaleDateString()
                  : "No date"}
              </p>
              <p className="text-sm mb-4">{post.excerpt}</p>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Link
                href={`/posts/${post.slug}`}
                className="text-primary hover:underline"
              >
                Read more
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
