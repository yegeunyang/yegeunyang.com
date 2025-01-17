import { getBlogPosts } from "app/blog/utils";

export const fullName = "Yegeun Yang";
export const description = "This is my personal website";
export const baseUrl = "https://yegeunyang.com";
export const githubURL = "https://github.com/yegeunyang";
export const linkedinURL = "https://linkedin.com/in/yegeunyang";

export default async function sitemap() {
  const blogs = getBlogPosts().map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.metadata.publishedOn,
  }));

  const routes = ["", "/blog"].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split("T")[0],
  }));

  return [...routes, ...blogs];
}
