import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany({ take: 1 });
  if (!users.length) return console.log('No user');
  console.log('User id:', users[0].id);
  try {
    await prisma.user.update({
      where: { id: users[0].id },
      data: {
        goldenCoins: {
          decrement: 0,
          increment: 900,
        }
      }
    });
    console.log('Success!');
  } catch (e) {
    console.error('Error:', e);
  }
  await prisma.$disconnect();
}
main();
