import { createClient } from "@/utils/supabase/server";
import HomePageWrapper from "@/components/homePageWrapper";

export default async function Home() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <HomePageWrapper user={user} />;
}
