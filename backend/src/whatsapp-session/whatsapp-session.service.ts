import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class WhatsappSessionService {
  constructor(private prisma: PrismaService) {}

  async handleInteractiveMenu(phone: string, input: string, profileName: string, sendMessageFn: (to: string, msg: string, imageUrl?: string) => Promise<any>, sendCatalogFn?: (to: string) => Promise<any>, sendFlowFn?: (to: string, msgText: string, flowId: string) => Promise<any>, sendButtonFn?: (to: string, msgText: string, buttons: Array<{id: string, title: string}>) => Promise<any>) {
    let session = await this.prisma.whatsappSession.upsert({
      where: { phone },
      create: { phone, state: 'menu' },
      update: {}
    });

    const now = new Date();
    const lastUpdate = new Date(session.updatedAt || now);
    const diffMins = (now.getTime() - lastUpdate.getTime()) / 60000;

    if (diffMins > 30 && session.state !== 'menu') {
      session = await this.prisma.whatsappSession.update({
        where: { phone },
        data: { state: 'menu', categoryId: null, subCategoryId: null, checkoutData: Prisma.JsonNull }
      });
      await sendMessageFn(phone, 'Your previous session expired due to inactivity. Starting fresh!');
    }

    const trimmedInput = input.trim();
    const lowerInput = trimmedInput.toLowerCase();

    if (lowerInput === 'exit' || lowerInput === 'cancel') {
      await this.prisma.whatsappSession.update({
        where: { phone },
        data: { state: 'menu', categoryId: null, subCategoryId: null, checkoutData: Prisma.JsonNull }
      });
      await sendMessageFn(phone, 'Your current session has been cancelled. Type "hi" to start over.');
      return;
    }

    if (lowerInput === 'menu' || lowerInput === '0' || lowerInput === 'hi' || lowerInput === 'hello' || lowerInput === 'start' || lowerInput === 'restart' || lowerInput === 'catalog') {
      await this.prisma.whatsappSession.update({
        where: { phone },
        data: { state: 'menu', categoryId: null, subCategoryId: null, checkoutData: Prisma.JsonNull }
      });
      
      if (sendCatalogFn && (lowerInput === 'hi' || lowerInput === 'hello' || lowerInput === 'start' || lowerInput === 'catalog')) {
         await sendCatalogFn(phone);
      } else {
         await this.sendCategoryMenu(phone, sendMessageFn);
      }
      return;
    }

    switch (session.state) {
      case 'menu':
        await this.handleCategorySelection(phone, trimmedInput, sendMessageFn);
        break;
      case 'category':
        if (session.categoryId) {
          await this.handleSubCategorySelection(phone, trimmedInput, session.categoryId, sendMessageFn);
        }
        break;
      case 'subcategory':
        if (session.subCategoryId) {
          await this.handleProductSelection(phone, trimmedInput, session.subCategoryId, sendMessageFn);
        }
        break;
      case 'product':
        await this.handleProductAction(phone, trimmedInput, session, sendMessageFn);
        break;
      case 'checkout_quantity':
        await this.handleCheckoutQuantity(phone, trimmedInput, session, sendMessageFn);
        break;
      case 'checkout_address':
        await this.handleCheckoutAddress(phone, trimmedInput, session, sendMessageFn, sendButtonFn);
        break;
      case 'checkout_saved_address':
        await this.handleCheckoutSavedAddress(phone, trimmedInput, session, sendMessageFn, sendFlowFn, sendButtonFn);
        break;
      case 'checkout_payment':
        await this.handleCheckoutPayment(phone, trimmedInput, session, sendMessageFn);
        break;
    }
  }

  async sendCategoryMenu(phone: string, sendMessageFn: (to: string, msg: string, imageUrl?: string) => Promise<any>) {
    const categories = await this.prisma.category.findMany({ orderBy: { id: 'asc' } });
    let message = '🛍️ *Welcome to EN3 Fashions!*\n\nSelect a category:\n\n';
    categories.forEach(cat => {
      message += `${cat.id}. ${cat.name}\n`;
    });
    message += '\n0. Main Menu';
    await sendMessageFn(phone, message);
  }

  async handleCategorySelection(phone: string, input: string, sendMessageFn: (to: string, msg: string, imageUrl?: string) => Promise<any>) {
    const categoryId = parseInt(input);
    if (isNaN(categoryId)) {
      return;
    }

    const category = await this.prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      return;
    }

    await this.prisma.whatsappSession.update({
      where: { phone },
      data: { state: 'category', categoryId }
    });

    const subCategories = await this.prisma.subCategory.findMany({
      where: { categoryId },
      orderBy: { id: 'asc' }
    });

    let message = `📂 *${category.name}*\n\nSelect a subcategory:\n\n`;
    subCategories.forEach(sub => {
      message += `${sub.id}. ${sub.name}\n`;
    });
    message += '\n0. Main Menu';
    await sendMessageFn(phone, message);
  }

  async handleSubCategorySelection(phone: string, input: string, categoryId: number, sendMessageFn: (to: string, msg: string, imageUrl?: string) => Promise<any>) {
    const subCategoryId = parseInt(input);
    if (isNaN(subCategoryId)) {
      return;
    }

    const subCategory = await this.prisma.subCategory.findFirst({
      where: { id: subCategoryId, categoryId }
    });

    if (!subCategory) {
      return;
    }

    await this.prisma.whatsappSession.update({
      where: { phone },
      data: { state: 'subcategory', subCategoryId }
    });

    const products = await this.prisma.product.findMany({
      where: { subCategoryId, status: 'active' },
      orderBy: { id: 'asc' },
      take: 20
    });

    let message = `🏷️ *${subCategory.name}*\n\nSelect a product:\n\n`;
    products.forEach(prod => {
      message += `${prod.id}. ${prod.name} - Rs.${prod.basePrice}\n`;
    });
    message += '\n0. Main Menu';
    await sendMessageFn(phone, message);
  }

  async handleProductSelection(phone: string, input: string, subCategoryId: number, sendMessageFn: (to: string, msg: string, imageUrl?: string) => Promise<any>) {
    const productId = parseInt(input);
    if (isNaN(productId)) {
      return;
    }

    const product = await this.prisma.product.findFirst({
      where: { id: productId, subCategoryId },
      include: { category: true, subCategory: true }
    });

    if (!product) {
      return;
    }

    let message = `✨ *${product.name}*\n\n`;
    message += `💰 Price: Rs.${product.basePrice}\n`;
    if (product.description) message += `📝 ${product.description}\n`;
    message += `\n🔗 View: ${process.env.FRONTEND_URL}/product/${product.id}\n`;
    message += `\n*Reply with 1 to Buy this via WhatsApp*`;
    message += '\nType "menu" or "0" to go back to main menu';

    await this.prisma.whatsappSession.update({
      where: { phone },
      data: { state: 'product', checkoutData: { productId: product.id } }
    });

    const gallery = product.gallery as any;
    const colors = product.colors as any;
    const imageUrl = gallery?.[0]?.url || colors?.[0]?.image;
    await sendMessageFn(phone, message, imageUrl);
  }

  async handleProductAction(phone: string, input: string, session: any, sendMessageFn: (to: string, msg: string, imageUrl?: string) => Promise<any>) {
    if (input === '1') {
       await this.prisma.whatsappSession.update({
         where: { phone },
         data: { state: 'checkout_quantity' }
       });
       await sendMessageFn(phone, 'How many would you like to buy? (e.g., 1, 2, 3...)');
    } else {
       await sendMessageFn(phone, 'Invalid selection. Reply with 1 to Buy, or type "menu" to go back.');
    }
  }

  async handleCheckoutQuantity(phone: string, input: string, session: any, sendMessageFn: (to: string, msg: string, imageUrl?: string) => Promise<any>) {
    const quantity = parseInt(input);
    if (isNaN(quantity) || quantity <= 0) {
      await sendMessageFn(phone, 'Please enter a valid number.');
      return;
    }
    const checkoutData = session.checkoutData as any;
    checkoutData.quantity = quantity;

    await this.prisma.whatsappSession.update({
      where: { phone },
      data: { state: 'checkout_address', checkoutData }
    });
    
    await sendMessageFn(phone, 'Great! Please reply with your full delivery address (including Name, Street, City, State, and Pincode).');
  }

  async handleCheckoutSavedAddress(phone: string, input: string, session: any, sendMessageFn: (to: string, msg: string, imageUrl?: string) => Promise<any>, sendFlowFn?: (to: string, msg: string, flowId: string) => Promise<any>, sendButtonFn?: (to: string, msgText: string, buttons: Array<{id: string, title: string}>) => Promise<any>) {
    if (input === 'DELIVER_HERE') {
      const checkoutData = session.checkoutData as any;
      checkoutData.address = JSON.stringify(checkoutData.savedAddress);

      await this.prisma.whatsappSession.update({
        where: { phone },
        data: { state: 'checkout_payment', checkoutData }
      });
      
      if (sendButtonFn) {
        await sendButtonFn(phone, 'How would you like to pay?', [
          { id: '1', title: 'Cash on Delivery' },
          { id: '2', title: 'Online Payment' }
        ]);
      } else {
        await sendMessageFn(phone, 'How would you like to pay?\n\n1. Cash on Delivery (COD)\n2. Online Payment\n\nReply with 1 or 2.');
      }
    } else if (input === 'NEW_ADDRESS') {
      const checkoutData = session.checkoutData as any;
      await this.prisma.whatsappSession.update({
        where: { phone },
        data: { state: 'checkout_address', checkoutData }
      });

      const flowId = process.env.META_FLOW_ID;
      if (sendFlowFn && flowId && flowId !== 'YOUR_FLOW_ID') {
         await sendFlowFn(phone, 'Please enter your new delivery address.', flowId);
      } else {
         await sendMessageFn(phone, '📍 Please reply with your **complete delivery address**:\n \n• Full Name\n• Street / Area\n• City\n• State\n• Pincode');
      }
    } else {
      await sendMessageFn(phone, 'Please select an option from the buttons above, or type "menu" to start over.');
    }
  }

  async handleCheckoutAddress(phone: string, input: string, session: any, sendMessageFn: (to: string, msg: string, imageUrl?: string) => Promise<any>, sendButtonFn?: (to: string, msgText: string, buttons: Array<{id: string, title: string}>) => Promise<any>) {
    const checkoutData = session.checkoutData as any;
    checkoutData.address = input;

    await this.prisma.whatsappSession.update({
      where: { phone },
      data: { state: 'checkout_payment', checkoutData }
    });
    
    if (sendButtonFn) {
      await sendButtonFn(phone, 'How would you like to pay?', [
        { id: '1', title: 'Cash on Delivery' },
        { id: '2', title: 'Online Payment' }
      ]);
    } else {
      await sendMessageFn(phone, 'How would you like to pay?\n\n1. Cash on Delivery (COD)\n2. Online Payment\n\nReply with 1 or 2.');
    }
  }

  async handleCheckoutPayment(phone: string, input: string, session: any, sendMessageFn: (to: string, msg: string, imageUrl?: string) => Promise<any>) {
    if (input !== '1' && input !== '2') {
      await sendMessageFn(phone, 'Please reply with 1 for COD or 2 for Online Payment.');
      return;
    }
    
    const isCod = input === '1';
    const paymentMethod = isCod ? 'COD' : 'ONLINE';
    const checkoutData = session.checkoutData as any;
    let total = 0;
    let orderItemsToCreate: any[] = [];

    if (checkoutData.isCatalogOrder) {
      total = checkoutData.total;
      orderItemsToCreate = checkoutData.items;
    } else {
      const product = await this.prisma.product.findUnique({ where: { id: checkoutData.productId } });
      if (!product) {
        await sendMessageFn(phone, 'Product not found. Please start over by typing "menu".');
        return;
      }
      const price = parseFloat(product.basePrice);
      total = price * checkoutData.quantity;
      const gallery = product.gallery as any;
      const colors = product.colors as any;
      const imageUrl = gallery?.[0]?.url || colors?.[0]?.image || '';
      
      orderItemsToCreate = [{
        productId: product.id,
        name: product.name,
        price: product.basePrice,
        imageUrl,
        quantity: checkoutData.quantity
      }];
    }

    let fullName = checkoutData.profileName || 'WhatsApp Customer';
    let city = 'N/A';
    let state = 'N/A';
    let pincode = 'N/A';
    let addressLine1 = checkoutData.address || '';

    if (addressLine1) {
      try {
        const parsed = JSON.parse(addressLine1);
        if (parsed && typeof parsed === 'object') {
          fullName = parsed.full_name || fullName;
          addressLine1 = parsed.address || '';
          city = parsed.city || city;
          state = parsed.state || state;
          pincode = parsed.pincode || pincode;
        }
      } catch (e) {
        // Fallback to text parsing
        // Split by newline or comma
        const parts = addressLine1.split(/[\n,]+/).map((p: string) => p.trim()).filter(Boolean);
        if (parts.length >= 4) {
          const lastPart = parts[parts.length - 1];
          // If last part is a 6-digit number, it's a pincode
          if (/^\d{6}$/.test(lastPart)) {
            pincode = lastPart;
            state = parts[parts.length - 2] || 'N/A';
            city = parts[parts.length - 3] || 'N/A';
            
            if (parts.length >= 5 && !/^\d/.test(parts[0])) {
              fullName = parts[0];
              addressLine1 = parts.slice(1, parts.length - 3).join(', ');
            } else {
              addressLine1 = parts.slice(0, parts.length - 3).join(', ');
            }
          }
        }
      }
    }

    const user = await this.prisma.user.findFirst({ where: { phone } });
    let userId = user?.id;

    if (!userId) {
       const newUser = await this.prisma.user.create({
         data: { phone, name: fullName }
       });
       userId = newUser.id;
    } else if (user?.name === 'WhatsApp Customer' || !user?.name) {
       await this.prisma.user.update({
         where: { id: userId },
         data: { name: fullName }
       });
    }

    const order = await this.prisma.order.create({
      data: {
        userId,
        status: isCod ? 'confirmed' : 'pending',
        subtotal: total.toString(),
        deliveryFee: "0",
        total: total.toString(),
        paymentMethod,
        source: checkoutData.isCatalogOrder ? 'WhatsApp Catalog' : 'WhatsApp Bot',
        shippingAddress: { fullName, mobile: phone, addressLine1, city, state, pincode },
        deliveryOption: { method: 'Standard' },
        items: {
          create: orderItemsToCreate
        }
      }
    });

    await this.prisma.whatsappSession.update({
      where: { phone },
      data: { state: 'menu', checkoutData: Prisma.DbNull, categoryId: null, subCategoryId: null }
    });

    const deliveryAddress = `${fullName}\n${addressLine1}\n${city}, ${state} - ${pincode}`;

    if (isCod) {
      await sendMessageFn(phone, `🎉 Order placed successfully!\nYour Order ID is #ORD-${order.id}.\nTotal Amount: Rs.${total}\nPayment: Cash on Delivery.\n\n📍 Delivery Address:\n${deliveryAddress}\n\nWe will process it shortly.`);
    } else {
      await sendMessageFn(phone, `🎉 Order #ORD-${order.id} initiated!\nTotal Amount: Rs.${total}\n\n📍 Delivery Address:\n${deliveryAddress}\n\nOur team will contact you shortly with the payment link. Thank you!`);
    }
  }

  async getSession(phone: string) {
    return this.prisma.whatsappSession.findUnique({ where: { phone } });
  }
}
