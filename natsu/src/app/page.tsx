import Image from "next/image";
import fs from "fs"
import path from "path"

const blogSectionHeader: string = "From the blog"
const blogSectionSubheader: string = "Learn how to grow your business with our expert advice."

const metadataPath: string = path.join(process.cwd(), "public/stories/metadata.json")

interface MetadataItem {
  id: number
  title: string
  href: string
  description: string
  imageUrl:  string
  date: string
  datetime: string,
  category: {
    title: string
    href: string
  }
  author : {
    name: string
    role: string
    href: string
    imageUrl: string
  }
}

function AuthorInformation({ post }) {
  return (
    <div className="mt-6 flex border-t border-gray-900/5 pt-6">
      <div className="relative flex items-center gap-x-4">
        <img alt="" src={ post.author.imageUrl ? post.author.imageUrl : null } className="h-10 w-10 rounded-full bg-gray-50" />
        <div className="text-sm/6">
          <p className="font-semibold text-gray-900">
            <a href={ post.author.href }>
              <span className="absolute inset-0" />
              { post.author.name }
            </a>
          </p>
          <p className="text-gray-600">{ post.author.role }</p>
        </div>
      </div>
    </div>
  )
}

function BlogSectionItemHeader({ post }) {
  return (
    <div className="group relative max-w-xl">
      <h3 className="mt-3 text-lg/6 font-semibold text-gray-900 group-hover:text-gray-600">
        <a href={ post.href }>
          <span className="absolute inset-0" />
          { post.title }
        </a>
      </h3>
      <p className="mt-5 text-sm/6 text-gray-600">{ post.description }</p>
    </div>
  )
}

function BlogSectionItemMetadata({ post }) {
  return (
    <div className="flex items-center gap-x-4 text-xs">
      <time dateTime={post.datetime} className="text-gray-500">
        {post.date}
      </time>
      <a
        href={ post.category.href }
        className="relative z-10 rounded-full bg-gray-50 px-3 py-1.5 font-medium text-gray-600 hover:bg-gray-100"
      >
        {post.category.title}
      </a>
    </div>
  )
}

function BlogSectionItemThumbnail({ post }) {
  return (
    <div className="relative aspect-[16/9] sm:aspect-[2/1] lg:aspect-square lg:w-64 lg:shrink-0">
      <img
        alt=""
        src={ post.imageUrl ? post.imageUrl : null }
        className="absolute inset-0 h-full w-full rounded-2xl bg-gray-50 object-cover"
      />
      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gray-900/10" />
    </div>
  )
}

function BlogSectionItem({ post }) {
  return (
    <article key={post.id} className="relative isolate flex flex-col gap-8 lg:flex-row">
      <BlogSectionItemThumbnail post={ post } />      
      <div>
        <BlogSectionItemMetadata post={ post } />        
        <BlogSectionItemHeader post={ post } />        
        <AuthorInformation post={ post } />        
      </div>
    </article>
  )
}

function BlogSection({ posts }) {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:max-w-4xl">
          <h2 className="text-pretty text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">{ blogSectionHeader }</h2>
          <p className="mt-2 text-lg/8 text-gray-600">{ blogSectionSubheader }</p>
          <div className="mt-16 space-y-20 lg:mt-20 lg:space-y-20">
            {posts.map((post, i) => (<BlogSectionItem key={ i } post={ post }/>))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  
  const postsJSONString = fs.readFileSync(metadataPath, 'utf8')
  const posts: MetadataItem[] = JSON.parse(postsJSONString)

  return (
    <main>
      <BlogSection posts={ posts } />
    </main>
  );
}
