export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { getSiteSetting } from "@/lib/site-settings";
import { HeroVideoUploader } from "./_components/HeroVideoUploader";
import { InstagramPostRow } from "./_components/InstagramPostRow";
import { AddInstagramPost } from "./_components/AddInstagramPost";

export default async function InstagramAdminPage() {
  const [posts, videoUrl] = await Promise.all([
    prisma.instagramPost.findMany({ orderBy: { sortOrder: "asc" } }),
    getSiteSetting("instagram_hero_video_url"),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl text-foreground">Instagram</h1>
        <p className="mt-1 text-muted-foreground">
          Gerencie o vídeo hero e os posts exibidos na homepage.
        </p>
      </div>

      <HeroVideoUploader currentUrl={videoUrl} />

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-xl text-foreground">
            Posts ({posts.length}/6)
          </h2>
          <AddInstagramPost />
        </div>
        <div className="space-y-3">
          {posts.map((post) => (
            <InstagramPostRow key={post.id} post={post} />
          ))}
          {posts.length === 0 ? (
            <p className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
              Nenhum post cadastrado ainda.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
