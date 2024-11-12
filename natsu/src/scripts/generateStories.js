import OpenAI from "openai"
import dotenv from "dotenv"
import fs from "fs"
import client from "https"

const OPENAI_MODEL = "gpt-4o";
const STORY_DIR = "public/stories/"
const STORY_DATA_PATH = "public/stories/metadata.json"

const GEN_STORY_TEXT_PROMPT = [
  { 
    role: "system",
    content: "You are an expert Japanese storyteller that tells stories for non-native speakers of a particular vocabulary level. Your stories are solely focused on helping readers understand a particular language concept, cultural concept, or a particular word's usage. Final response should only include the story in an HTML format and the relavent metadata tags (in English).",
  },
  { 
    role: "user",
    content: "Generate an HTML story for a user of JLPT N5 level to understand adjectives.",
  },
  {
    role: "assistant",
    content: `
\`\`\`meta
title: My Love
topics: Adjectives
description: Mr. Tanaka visits a spacious park with large trees and red flowers. He enjoys music on a quiet bench, checks the chill of a clear river, and heads home after a delightful day. 
\`\`\`
\`\`\`html
<h1>たなかさんの一日</h1>

<p>ある日、たなかさんは<strong>元気(げんき)</strong>で<strong>新しい(あたらしい)</strong>公園(こうえん)に行きました。</p>

<p>公園は<strong>広い(ひろい)</strong>です。たくさんの<strong>大きい(おおきい)</strong>木(き)があります。</p>

<p>たなかさんは<strong>美しい(うつくしい)</strong>花(はな)を見ました。花は<strong>赤い(あかい)</strong>です。</p>

<p>彼(かれ)は<strong>楽しい(たのしい)</strong>音楽(おんがく)を聞(き)きながら、<strong>静か(しずか)</strong>なベンチに座(すわ)りました。</p>

<p>それから、<strong>寒い(さむい)</strong>かどうか見(み)に<strong>冷たい(つめたい)</strong>川へ歩(ある)きました。</p>

<p>川の水(みず)は<strong>清(きよ)らか</strong>で<strong>流れ(ながれ)</strong>が<strong>速い(はやい)</strong>です。</p>

<p>その後(あと)、たなかさんは家(いえ)に帰(かえ)りました。今日は<strong>長い(ながい)</strong>けど、<strong>素晴らしい(すばらしい)</strong>一日でした。</p>
\`\`\``  
  },
  {
    role: "user",
    content: "Generate an HTML story for a user of JLPT N5 level to understand adjectives.",
  }
];

dotenv.config({ path: ".env.local" })

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

if (!fs.existsSync(STORY_DATA_PATH)) {
  fs.writeFileSync(STORY_DATA_PATH, "[]")
}

const metadata = JSON.parse(fs.readFileSync(STORY_DATA_PATH, "utf-8"))

const completion = await openai.chat.completions.create({
  model: OPENAI_MODEL,
  messages: GEN_STORY_TEXT_PROMPT,
});

const storyHtml = completion.choices[0].message.content

const regexTitle = /title:\s*(.*)/
const title = regexTitle.exec(storyHtml)[1]

const storyPath = `${ STORY_DIR }/${ title }.html`
fs.writeFileSync(storyPath, storyHtml)
console.log(`Story generated:\n\n${ storyHtml }`)
console.log("Generating thumbnail...")
const regexDescription = /description:\s*(.*)/
const description = regexDescription.exec(storyHtml)[1]

const GEN_THUMBNAIL_PROMPT = [
  {
    role: "system",
    content: "You are a photorealistic image generator."
  },
  {
    role: "user",
    content: `Generate an image based on the following description: ${ description }`
  }
]

const imageResponse = await openai.images.generate({
  model: "dall-e-3",
  prompt: description,
  n: 1,
  size: "1792x1024",
  quality: "hd"
})

const url = imageResponse.data[0].url

console.log(`Image generated at: ${ url }`)

const imagePath = `public/stories/images/${ title }.png`

function downloadImage(url, filePath) {
  return new Promise((resolve, reject) => {
    client.get(url, (res) => {
      if (res.statusCode === 200) {
        res.pipe(fs.createWriteStream(imagePath))
          .on("error", reject)
          .once("close", () => resolve(imagePath))
      } else {
        res.resume()
        reject(new Error(`Request failed with status code :${ res.statusCode } `))
      }
    }) 
  }) 
}

downloadImage(url, imagePath)

const metadataCompletion = await openai.chat.completions.create({
  model: "gpt-4o-2024-08-06",
  messages: [
    {
      role: "system", content: "You generate JSON files for stories that are written in various languages. The content of the JSON you create is only English. Do not modify the following fields: imageUrl, author, id, href, date, datetime."
    },
    {
      role: "user", content: storyHtml
    },
  ],
  response_format: {
    type: "json_schema",
    json_schema: {
      name: "story_schema",
      schema: {
        type: "object",
        properties: {
          id: {
            type: "number",
            description: "The id number does not need to be set by you."
          },
          title: {
            type: "string",
            description: "Denoted by the Title: tag"
          },
          href: {
            type: "string",
            description: "Doesn't need to be set by you."
          },
          description: {
            type: "string",
            description: "Denoted by the Description: tag"
          },
          imageUrl: {
            type: "string",
            description: "Doesn't need to be set by you."
          },
          date: {
            type: "string",
            description: "Doesn't need to be set by you."
          },
          datetime: {
            type: "string",
            description: "Doesn't need to be set by you."
          },
          category: {
            type: "object",
            description: "The category that the text is classified with base on language level.",
            properties: {
              title: {
                type: "string", 
                description: 'Based on topics'
              },
              href: {
                type: "string",
                description: "Doesn't need to be set by you"
              }
            } 
          },
          author: {
            type: "object",
            description: "Contains information about the author.",
            properties: {
              name: {
                type: "string",
                description: "Set this as Arthur Riechert"
              },
              role: {
                type: "string",
                description: "Set this as Founder"
              },
              href: {
                type: "string",
                description: "You don't need to set this." 
              },
              imageUrl: {
                type: "string",
                description: "You don't need to set this."
              }
            }
          },
        },
      }
    } 
  }
})

const metadataEntry = JSON.parse(metadataCompletion.choices[0].message.content)
metadataEntry.id = metadata.length
metadataEntry.href = `/stories/${ title }`
metadataEntry.imageUrl = `/stories/images/${ title }.png`
metadataEntry.date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric'})
metadataEntry.datetime = new Date().toISOString().split('T')[0] 

metadata.push(metadataEntry)

const jsonString = JSON.stringify(metadata, null, 2)

fs.writeFileSync(STORY_DATA_PATH, jsonString)

console.log(`Wrote the following metadata to stories:\n\n${ jsonString }`)
