import { redirect } from "next/navigation";

export default function DonateCancelledRedirect() {
  redirect("/support/cancelled");
}
