import { createClient } from "@/utils/supabase/server";
import HomePageWrapper from "@/components/homePageWrapper";
import { JwtClaims } from "@/types/supabase";

export default async function Home() {
  const supabase = await createClient();
  const {
    data,
  } = await supabase.auth.getClaims();

  if (!data) {
    return <HomePageWrapper user={null} />;
  }

  return <HomePageWrapper user={data.claims as JwtClaims} />;
}
