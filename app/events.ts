import { createClient } from "@/utils/supabase/client";

export interface Event {
    id: number;
    name: string;
    category: string;
    image: string;
    register: string;
    date: string;
    time: string;
    location: string;
    description: string;
    one_liner: string;
    banner_image: string;
}
export default async function getEvents() {
    const supabase = createClient();
    const { data, error } = await supabase.from("events").select("*");
    if (error || !data) {
        console.error(error);
        return [];
    }
    
    const parsedData = data.map(event => {
        const dateTime = new Date(event.datetime);
        const date = dateTime.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
        const time = dateTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        
        const { datetime, ...rest } = event;
        return {
            ...rest,
            date,
            time
        };
    });

    console.log(parsedData);

    return parsedData;
}
