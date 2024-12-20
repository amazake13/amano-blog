import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypePrism from "rehype-prism-plus";
import rehypeCodeTitles from "rehype-code-titles";
import rehypeKatex from "rehype-katex";
import rehypeStringify from "rehype-stringify";
import rehypeRaw from "rehype-raw";

export default async function markdownToHtml(markdown: string) {
  const result = await unified()
    .use(remarkParse)
    .use(remarkMath)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeKatex)
    .use(rehypeCodeTitles)
    .use(rehypePrism, { showLineNumbers: true })
    .use(rehypeStringify)
    .process(markdown);

  return result.toString();
}
