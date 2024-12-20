import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";
import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const n2m = new NotionToMarkdown({ notionClient: notion });

export async function getDatabase(databaseId: string) {
  const response = await notion.databases.query({
    database_id: databaseId!,
    filter: {
      property: "Published",
      checkbox: {
        equals: true,
      },
    },
    sorts: [
      {
        property: "Date",
        direction: "descending",
      },
    ],
  });
  return response.results.filter(
    (page): page is PageObjectResponse => "properties" in page
  );
}

export async function getPage(pageId: string) {
  const response = await notion.pages.retrieve({ page_id: pageId });
  return response;
}

export async function getPageContent(pageId: string) {
  const mdblocks = await n2m.pageToMarkdown(pageId);
  const mdString = n2m.toMarkdownString(mdblocks);
  return mdString;
}
