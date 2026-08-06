import { PrismaClient } from '@prisma/client';
import { normalizePhone } from './src/utils/phone.util';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting phone number normalization cleanup...');
  
  // Find all users with phone numbers longer than 10 digits
  const usersToUpdate = await prisma.user.findMany({
    where: {
      phone: {
        not: null
      }
    }
  });

  const usersWithLongPhones = usersToUpdate.filter(u => u.phone && u.phone.length > 10);
  console.log(`Found ${usersWithLongPhones.length} users with non-normalized phone numbers.`);

  for (const user of usersWithLongPhones) {
    if (!user.phone) continue;
    
    const normalized = normalizePhone(user.phone);
    if (normalized === user.phone) continue; // No change needed (maybe international?)

    console.log(`Processing user ${user.id} (${user.phone}) -> ${normalized}`);

    // Check if a user with the normalized phone already exists
    const existingUser = await prisma.user.findUnique({
      where: { phone: normalized }
    });

    if (existingUser) {
      console.log(`  -> Duplicate found (User ${existingUser.id}). Merging data...`);
      
      // Update all related records to point to the existing 10-digit user
      
      // 1. Orders
      await prisma.order.updateMany({
        where: { userId: user.id },
        data: { userId: existingUser.id }
      });
      
      // 2. Cart (Delete duplicate cart if existing user has one, otherwise transfer)
      const existingCart = await prisma.cart.findUnique({ where: { userId: existingUser.id } });
      const currentCart = await prisma.cart.findUnique({ where: { userId: user.id } });
      
      if (currentCart && !existingCart) {
        await prisma.cart.update({
          where: { id: currentCart.id },
          data: { userId: existingUser.id }
        });
      } else if (currentCart && existingCart) {
        // Just delete the duplicate cart
        await prisma.cart.delete({ where: { id: currentCart.id } });
      }

      // 3. Wishlist Items
      // Note: Ignoring unique constraint conflicts for now by just deleting duplicates
      await prisma.wishlistItem.deleteMany({ where: { userId: user.id } });

      // 4. Coupon Usages
      await prisma.couponUsage.updateMany({
        where: { userId: user.id },
        data: { userId: existingUser.id }
      });

      // 5. Otps
      await prisma.otp.updateMany({
        where: { userId: user.id },
        data: { userId: existingUser.id }
      });
      
      // Finally, delete the duplicate user
      await prisma.user.delete({ where: { id: user.id } });
      console.log(`  -> Merged successfully and deleted user ${user.id}`);
      
    } else {
      console.log(`  -> No duplicate found. Simply updating phone number.`);
      await prisma.user.update({
        where: { id: user.id },
        data: { phone: normalized }
      });
    }
  }
  
  // Cleanup WhatsappSession table
  console.log('\nCleaning up WhatsappSession table...');
  const sessions = await prisma.whatsappSession.findMany();
  for (const session of sessions) {
    const normalized = normalizePhone(session.phone);
    if (normalized !== session.phone) {
      // Check if normalized session exists
      const existing = await prisma.whatsappSession.findUnique({ where: { phone: normalized } });
      if (existing) {
        await prisma.whatsappSession.delete({ where: { id: session.id } });
      } else {
        await prisma.whatsappSession.update({
          where: { id: session.id },
          data: { phone: normalized }
        });
      }
      console.log(`  -> Session ${session.phone} normalized to ${normalized}`);
    }
  }

  console.log('Cleanup completed!');
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
