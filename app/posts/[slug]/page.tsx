import { getDatabase, getPageContent } from "@/lib/notion";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import markdownToHtml from "@/lib/markdownToHtml";
import "../../styles/prism-solarized-dark-atom.css";
import "katex/dist/katex.min.css";

export const revalidate = 3600; // revalidate every hour

export async function generateStaticParams() {
  const databaseId = process.env.NOTION_DATABASE_ID;
  const posts = await getDatabase(databaseId!);
  return posts.map((post) => ({
    slug:
      post.properties.Slug.type === "rich_text"
        ? post.properties.Slug.rich_text[0].plain_text
        : "",
  }));
}

async function getPost(slug: string) {
  const databaseId = process.env.NOTION_DATABASE_ID;
  const posts = await getDatabase(databaseId!);
  const post = posts.find(
    (post) =>
      post.properties.Slug.type === "rich_text" &&
      post.properties.Slug.rich_text[0].plain_text === slug
  );

  if (!post) return null;

  const content = await getPageContent(post.id);

  return {
    id: post.id,
    title:
      post.properties.Title.type === "title"
        ? post.properties.Title.title[0].plain_text
        : "",
    slug:
      post.properties.Slug.type === "rich_text"
        ? post.properties.Slug.rich_text
        : "",
    date:
      post.properties.Date.type === "date"
        ? post.properties.Date.date?.start
        : "",
    tags:
      post.properties.Tags.type === "multi_select"
        ? post.properties.Tags.multi_select.map((tag) => tag.name)
        : [],
    excerpt:
      post.properties.Excerpt.type === "rich_text"
        ? post.properties.Excerpt.rich_text[0].plain_text
        : "",
    image:
      post.properties.Image.type === "url" ? post.properties.Image.url : "",
    content,
  };
}

export default async function PostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPost(params.slug);

  if (!post) {
    notFound();
  }

  const contentHtml = await markdownToHtml(post.content.parent);

  return (
    <div className="container mx-auto px-4 py-8">
      <article className="max-w-3xl mx-auto">
        {post.image && (
          <Image
            src={post.image}
            alt={post.title}
            width={800}
            height={400}
            className="rounded-lg object-cover w-full h-64 mb-8"
          />
        )}
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        <p className="text-gray-500 mb-4">
          {post.date ? new Date(post.date).toLocaleDateString() : "No date"}
        </p>
        <div className="flex flex-wrap gap-2 mb-8">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="prose max-w-none">
          <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
        </div>
      </article>
    </div>
  );
}
