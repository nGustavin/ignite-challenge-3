/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/explicit-function-return-type */

import Prismic from '@prismicio/client';
import format from 'date-fns/format';
import { GetStaticProps } from 'next';
import Link from 'next/link';
import { RichText } from 'prismic-dom';
import { useState } from 'react';
import { BsCalendar4Event } from 'react-icons/bs';
import { FiUser } from 'react-icons/fi';
import Header from '../components/Header';
import { getPrismicClient } from '../services/prismic';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState<Post[] | any>(postsPagination.results);
  const [nextPage, setNextPage] = useState<string | null>(
    postsPagination.next_page
  );

  const handleLoadNextPage = async () => {
    await fetch(postsPagination.next_page)
      .then(response => response.json())
      .then(res => {
        setNextPage(res.nextPage);
        const nextPagePosts = res.results.map(post => {
          return {
            uid: post.uid,
            first_publication_date: format(
              new Date(post.first_publication_date),
              'dd MMM yyyy'
            ),
            data: {
              title: post.data.title,
              subtitle: post.data.subtitle,
              author: post.data.author,
            },
          };
        });

        setPosts([...posts, ...nextPagePosts]);
      });
  };

  return (
    <>
      <Header />
      <main className={styles.main}>
        {posts?.map(({ uid, data, first_publication_date }) => (
          <Link href={`/post/${uid}`} key={uid}>
            <div className={styles.postContainer}>
              <h1>{data.title}</h1>
              <p>{data.subtitle}</p>
              <footer className={styles.postFooter}>
                <div>
                  <BsCalendar4Event size={21} color="var(--info)" />
                  <span>{first_publication_date}</span>
                </div>
                <div>
                  <FiUser size={22} color="var(--info)" />
                  <span>{data.author}</span>
                </div>
              </footer>
            </div>
          </Link>
        ))}
        {nextPage && (
          <button type="button" onClick={handleLoadNextPage}>
            Carregar mais posts
          </button>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 2,
      page: 1,
    }
  );

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: format(
        new Date(post.first_publication_date),
        'dd MMM yyyy'
      ),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  return {
    props: {
      postsPagination: {
        results: posts,
        next_page: postsResponse.next_page,
      },
    },
    // revalidate:
  };
};
