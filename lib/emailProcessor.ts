import { prisma } from './prisma'; // Putanja do tvoje Prisma instancije

export async function processEmailData(data: any) {
  const { subject, body, from } = data;

  await prisma.humanitarniUgovori.upsert({
    where: { emailSubject: subject },
    update: { emailBody: body, sender: from },
    create: { emailSubject: subject, emailBody: body, sender: from },
  });
}
