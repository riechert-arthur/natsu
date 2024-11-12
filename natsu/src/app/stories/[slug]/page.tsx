import fs from "fs"

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const rawSlug = (await params).slug
  const slug = decodeURIComponent(rawSlug)

  const html = fs.readFileSync(`public/stories/${ slug }.html`, 'utf-8')

  return (
    <div 
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
