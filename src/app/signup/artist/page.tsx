import { redirect } from "next/navigation";

export default function SignupArtistRedirect() {
  redirect("/signup?intent=artist");
}
