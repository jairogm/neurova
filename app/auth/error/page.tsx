import { getLocale } from "next-intl/server";
import { workspaceText } from "@/i18n/workspace";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  const tr = workspaceText(await getLocale());
  const params = await searchParams;

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{tr("Sorry, something went wrong.")}</CardTitle>
            </CardHeader>
            <CardContent>
              {params?.error ? (
                <p className="text-sm text-muted-foreground">{tr("Code error:")} {params.error}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">{tr("An unspecified error occurred.")}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
