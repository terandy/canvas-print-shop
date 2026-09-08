// Shared by the desktop collection menu and the mobile drawer.
export const printLinks = [
  {
    key: "canvas",
    path: "/product/canvas",
    image: "/canvas-in-living-room.jpeg",
  },
  {
    key: "rolledCanvas",
    path: "/product/rolled-canvas-prints",
    image:
      "https://print-and-canvas-bucket.s3.us-east-2.amazonaws.com/uploads/1e0eca6aa85b208e978b398525ff145b-1771036088899.webp",
  },
] as const;

export const editorialLinks = [
  { key: "ourCraft", path: "/how-we-make-our-canvas-prints" },
  { key: "guides", path: "/blog" },
] as const;
