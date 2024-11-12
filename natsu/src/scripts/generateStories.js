import OpenAI from "openai"
import dotenv from "dotenv"
import fs from "fs"

const OPENAI_MODEL = "gpt-4o";
const STORY_DIR = "stories/"

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

const completion = await openai.chat.completions.create({
  model: OPENAI_MODEL,
  messages: GEN_STORY_TEXT_PROMPT,
});

const storyHtml = completion.choices[0].message.content

console.log(`Story generated:\n\n${ storyHtml }`)

const regex = /title:\s*(.*)/
const title = regex.exec(storyHtml)[1]

fs.writeFileSync(`${ STORY_DIR }/${ title }.html`, storyHtml)
