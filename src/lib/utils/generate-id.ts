import { PrismaClient } from "@prisma/client";

type Prefix = "U" | "S" | "C" | "T";

export async function generateId(prisma: PrismaClient, prefix: Prefix): Promise<string> {
  const tableMap: Record<Prefix, { model: keyof PrismaClient; idField: string }> = {
    U: { model: "user_access", idField: "user_id" },
    S: { model: "student_profile", idField: "student_id" },
    C: { model: "company_profile", idField: "company_id" },
    T: { model: "university_profile", idField: "university_id" },
  };

  const { model, idField } = tableMap[prefix];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const latest = await (prisma[model] as any).findFirst({
    orderBy: { [idField]: "desc" },
    select: { [idField]: true },
  });

  const lastNum = latest ? parseInt(latest[idField].slice(1)) : 0;
  const nextNum = lastNum + 1;
  return `${prefix}${String(nextNum).padStart(7, "0")}`;
}
