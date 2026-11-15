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
  { name: "Gowrika Mahesh", initials: "GM", callsign: "Agni", element: "fire", color: "#ff8a3d" },
  { name: "Utkarsh Sawant", initials: "US", callsign: "Jala", element: "water", color: "#4db8ff" },
  { name: "Arun Kumar", initials: "AK", callsign: "Vayu", element: "air", color: "#8be8cf" },
];
