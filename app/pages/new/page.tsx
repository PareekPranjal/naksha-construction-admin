import { PageForm } from "@/components/PageForm";
import { PageHeader } from "@/components/ui";

export default function NewPagePage() {
  return (
    <div>
      <PageHeader title="New page" />
      <PageForm mode="create" />
    </div>
  );
}
