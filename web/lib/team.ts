// The team. Callsigns are the Sanskrit words for the three elements: Agni (fire), Jala (water), Vayu (air).
//
// To add a photo: put a square image (about 600 px) in web/public/team/ and set `photo` below, for example "/team/gowrika.jpg".
// To add a role, a one-line bio or links, fill in the optional fields. Anything left out is simply not shown.
// Everyone pictured must be an adult and must agree to their photo being published.

export type Member = {
  name: string;
  initials: string;
  callsign: string;
  element: "fire" | "water" | "air";
  color: string;
  photo?: string;
  role?: string;
  bio?: string;
  links?: { label: string; href: string }[];
};

export const CREW: Member[] = [
  { name: "Gowrika Mahesh", initials: "GM", callsign: "Agni", element: "fire", color: "#ff8a3d",
    photo: "/team/gowrika.jpg", role: "AI engineer",
    bio: "Keeps the AI honest: every claim traces back to a NASA test.",
    links: [{ label: "LinkedIn", href: "https://www.linkedin.com/in/gowrika-mahesh-092873215/" }, { label: "GitHub", href: "https://github.com/Gowrikamahesh17" }] },
  { name: "Utkarsh Sawant", initials: "US", callsign: "Jala", element: "water", color: "#4db8ff",
    photo: "/team/utkarsh.jpg", role: "Data engineer",
    bio: "Keeps the data pipeline steady so everything built on top of it holds.",
    links: [{ label: "LinkedIn", href: "https://www.linkedin.com/in/utkarsh-sawant/" }, { label: "GitHub", href: "https://github.com/utkarshsawant65" }] },
  { name: "Arun Kumar", initials: "AK", callsign: "Vayu", element: "air", color: "#8be8cf",
    photo: "/team/arun.png", role: "ML ops engineer",
    bio: "Makes sure what we built keeps working, and works the same way every time.",
    links: [{ label: "LinkedIn", href: "https://www.linkedin.com/in/arun-kumar-94in/" }, { label: "GitHub", href: "https://github.com/arundahiya94" }] },
];
