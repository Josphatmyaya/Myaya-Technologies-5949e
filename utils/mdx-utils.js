import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { serialize } from 'next-mdx-remote/serialize';
import rehypePrism from '@mapbox/rehype-prism';
import remarkGfm from 'remark-gfm';
import rehypeUnwrapImages from 'rehype-unwrap-images';

// MYAYA MUXIK: Base folder for all blog posts
export const MUXIK_POSTS_PATH = path.join(process.cwd(), 'posts');

// MYAYA MUXIK: Get all MDX post file names in posts directory
export const getMuxikPostFilePaths = () => {
  return fs
    .readdirSync(MUXIK_POSTS_PATH)
    .filter((fileName) => /\.mdx?$/.test(fileName));
};

// MYAYA MUXIK: Sort posts descending by date (newest first)
export const sortMuxikPostsByDate = (posts) => {
  return posts.sort((postA, postB) => {
    const dateA = new Date(postA.data.date);
    const dateB = new Date(postB.data.date);
    return dateB - dateA;
  });
};

// MYAYA MUXIK: Load all posts metadata and content
export const getMuxikPosts = () => {
  let posts = getMuxikPostFilePaths().map((fileName) => {
    const fullPath = path.join(MUXIK_POSTS_PATH, fileName);
    const fileSource = fs.readFileSync(fullPath, 'utf8');
    const { content, data } = matter(fileSource);

    return {
      content,
      data,
      fileName,
    };
  });

  posts = sortMuxikPostsByDate(posts);

  return posts;
};

// MYAYA MUXIK: Get serialized MDX post content and frontmatter by slug
export const getMuxikPostBySlug = async (slug) => {
  const postFilePath = path.join(MUXIK_POSTS_PATH, `${slug}.mdx`);
  const source = fs.readFileSync(postFilePath, 'utf8');
  const { content, data } = matter(source);

  const mdxSource = await serialize(content, {
    mdxOptions: {
      remarkPlugins: [remarkGfm],
      rehypePlugins: [rehypePrism, rehypeUnwrapImages],
    },
    scope: data,
  });

  return { mdxSource, data, postFilePath };
};

// MYAYA MUXIK: Get the next post based on current slug
export const getMuxikNextPostBySlug = (slug) => {
  const posts = getMuxikPosts();
  const currentFileName = `${slug}.mdx`;
  const currentIndex = posts.findIndex((post) => post.fileName === currentFileName);

  // Next post is the one before current because posts are sorted newest first
  const nextPost = posts[currentIndex - 1];

  if (!nextPost) return null;

  return {
    title: nextPost.data.title,
    slug: nextPost.fileName.replace(/\.mdx?$/, ''),
  };
};

// MYAYA MUXIK: Get the previous post based on current slug
export const getMuxikPreviousPostBySlug = (slug) => {
  const posts = getMuxikPosts();
  const currentFileName = `${slug}.mdx`;
  const currentIndex = posts.findIndex((post) => post.fileName === currentFileName);

  // Previous post is the one after current
  const previousPost = posts[currentIndex + 1];

  if (!previousPost) return null;

  return {
    title: previousPost.data.title,
    slug: previousPost.fileName.replace(/\.mdx?$/, ''),
  };
};
