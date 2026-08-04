import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../prisma.service';
import { WhatsappSessionService } from '../whatsapp-session/whatsapp-session.service';
 
@Injectable()
export class WhatsappService {
  private readonly apiUrl = process.env.WHATSAPP_API_URL;
  private readonly phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  private readonly accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
 
  constructor(
    private prisma: PrismaService,
    private sessionService: WhatsappSessionService
  ) {
    if (!this.apiUrl || !this.phoneNumberId || !this.accessToken) {
      console.warn('WhatsApp configuration incomplete. Messages will not be sent.');
    }
  }
 
  async handleIncomingMessage(message: any) {
    const from = message.from;
    const profileName = message.profileName || 'WhatsApp Customer';
    const messageId = message.id;
    const interactive = message.interactive;
    const text = message.text?.body || (interactive?.type === 'nfm_reply' ? interactive.nfm_reply.response_json : null);
    const image = message.image;
    const video = message.video;
    const document = message.document;
    const audio = message.audio;
    const order = message.order; // Native WhatsApp Cart Checkout
 
    let mediaType: string | null = null;
    let mediaUrl: string | null = null;
 
    if (image) {
      mediaType = 'image';
      mediaUrl = await this.downloadMedia(image.id);
    } else if (video) {
      mediaType = 'video';
      mediaUrl = await this.downloadMedia(video.id);
    } else if (document) {
      mediaType = 'document';
      mediaUrl = await this.downloadMedia(document.id);
    } else if (audio) {
      mediaType = 'audio';
      mediaUrl = await this.downloadMedia(audio.id);
    }
 
    await this.prisma.whatsappMessage.create({
      data: {
        messageId,
        from,
        message: text || (mediaType ? `${mediaType} file` : (order ? 'WhatsApp Cart Order' : null)),
        mediaType,
        mediaUrl,
        direction: 'incoming',
        status: 'received'
      }
    });

    if (order) {
      await this.handleWhatsAppOrder(from, order, profileName);
      return;
    }

    if (text) {
      await this.sessionService.handleInteractiveMenu(
        from, 
        text, 
        profileName, 
        async (to, msg, imageUrl) => {
          if (imageUrl) {
            return this.sendMediaMessage(to, imageUrl, 'image', msg);
          }
          return this.sendMessage(to, msg);
        },
        async (to) => {
          return this.sendCatalogMessage(to);
        }
      );
    }
 
    console.log(`Message from ${from}: ${text || mediaType}`);
  }
 
  async downloadMedia(mediaId: string): Promise<string | null> {
    try {
      console.log('Downloading media:', mediaId);
     
      const mediaInfoResponse = await axios.get(
        `${this.apiUrl}/${mediaId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );
     
      console.log('Media info:', mediaInfoResponse.data);
      const mediaUrl = mediaInfoResponse.data.url;
     
      if (!mediaUrl) {
        console.error('No media URL found');
        return null;
      }
     
      const mediaDataResponse = await axios.get(mediaUrl, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        },
        responseType: 'arraybuffer'
      });
 
      const fs = require('fs');
      const path = require('path');
      const crypto = require('crypto');
     
      const ext = mediaInfoResponse.data.mime_type?.split('/')[1] || 'jpg';
      const filename = `${crypto.randomBytes(16).toString('hex')}.${ext}`;
      const filepath = path.join('uploads', filename);
     
      fs.writeFileSync(filepath, mediaDataResponse.data);
     
      const finalUrl = `${process.env.UPLOAD_URL}/${filename}`;
      console.log('Media saved:', finalUrl);
     
      return finalUrl;
    } catch (error) {
      console.error('Media download error:', error.response?.data || error.message);
      return null;
    }
  }
 
  async sendMessage(to: string, message: string) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to,
          type: 'text',
          text: { body: message }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      await this.prisma.whatsappMessage.create({
        data: {
          messageId: response.data.messages[0].id,
          from: to,
          message,
          direction: 'outgoing',
          status: 'sent'
        }
      });
 
      return { success: true, messageId: response.data.messages[0].id };
    } catch (error) {
      console.error('WhatsApp API Error:', error.response?.data || error.message);
      return { success: false, error: error.message };
    }
  }

  async sendCatalogMessage(to: string, message: string = '🛍️ Welcome to our store! Browse our catalog below.') {
    try {
      const response = await axios.post(
        `${this.apiUrl}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to,
          type: 'interactive',
          interactive: {
            type: 'catalog_message',
            body: {
              text: message
            },
            action: {
              name: 'catalog_message'
            }
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      await this.prisma.whatsappMessage.create({
        data: {
          messageId: response.data.messages[0].id,
          from: to,
          message: '[Catalog Message Sent]',
          direction: 'outgoing',
          status: 'sent'
        }
      });
 
      return { success: true, messageId: response.data.messages[0].id };
    } catch (error) {
      console.error('WhatsApp Catalog API Error:', error.response?.data || error.message);
      return { success: false, error: error.message };
    }
  }

  async sendFlowMessage(to: string, bodyText: string, flowId: string) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to,
          type: 'interactive',
          interactive: {
            type: 'flow',
            header: {
              type: 'text',
              text: 'Complete Your Order'
            },
            body: {
              text: bodyText
            },
            footer: {
              text: 'Secure Checkout'
            },
            action: {
              name: 'flow',
              parameters: {
                flow_message_version: '3',
                flow_token: `order_${Date.now()}_${to}`,
                flow_id: flowId,
                flow_cta: 'Enter Delivery Address',
                flow_action: 'navigate',
                flow_action_payload: {
                  screen: 'ADDRESS_FORM'
                }
              }
            }
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      await this.prisma.whatsappMessage.create({
        data: {
          messageId: response.data.messages[0].id,
          from: to,
          message: '[Flow Form Sent]',
          direction: 'outgoing',
          status: 'sent'
        }
      });
 
      return { success: true, messageId: response.data.messages[0].id };
    } catch (error) {
      console.error('WhatsApp API Flow Error:', error.response?.data || error.message);
      return { success: false, error: error.message };
    }
  }
 
  async sendMediaMessage(to: string, mediaUrl: string, mediaType: string, caption?: string) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to,
          type: mediaType,
          [mediaType]: { link: mediaUrl, caption }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
 
      await this.prisma.whatsappMessage.create({
        data: {
          messageId: response.data.messages[0].id,
          from: to,
          message: caption || `${mediaType} file`,
          mediaType,
          mediaUrl,
          direction: 'outgoing',
          status: 'sent'
        }
      });
 
      return { success: true, messageId: response.data.messages[0].id };
    } catch (error) {
      console.error('WhatsApp Media API Error:', error.response?.data || error.message);
      return { success: false, error: error.message };
    }
  }
 
  async updateMessageStatus(messageId: string, status: string) {
    try {
      await this.prisma.whatsappMessage.updateMany({
        where: { messageId },
        data: { status }
      });
      console.log(`Message ${messageId} status updated to ${status}`);
      return { messageId, status };
    } catch (error) {
      console.error('Error updating message status:', error);
      return null;
    }
  }
 
  async getMessageStatus(messageId: string) {
    try {
      const message = await this.prisma.whatsappMessage.findFirst({
        where: { messageId }
      });
      return message?.status || 'unknown';
    } catch (error) {
      console.error('Error getting message status:', error);
      return 'unknown';
    }
  }
 
  async getMessages(phoneNumber?: string) {
    return this.prisma.whatsappMessage.findMany({
      where: phoneNumber ? { from: phoneNumber } : {},
      orderBy: { createdAt: 'asc' },
    });
  }
 
  async sendBulkTemplateMessage(phoneNumbers: string[], templateName: string, parameters?: any[]) {
    // TEMPORARILY DISABLED
    return [];
    /*
    const results: Array<{ phoneNumber: string; success: boolean; messageId?: string; error?: string }> = [];
   
    for (const phoneNumber of phoneNumbers) {
      try {
        const response = await axios.post(
          `${this.apiUrl}/${this.phoneNumberId}/messages`,
          {
            messaging_product: 'whatsapp',
            to: phoneNumber,
            type: 'template',
            template: {
              name: templateName,
              language: { code: 'en' },
              components: parameters ? [
                {
                  type: 'body',
                  parameters: parameters.map(param => ({ type: 'text', text: param }))
                }
              ] : []
            }
          },
          {
            headers: {
              'Authorization': `Bearer ${this.accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
 
        await this.prisma.whatsappMessage.create({
          data: {
            messageId: response.data.messages[0].id,
            from: phoneNumber,
            message: `Template ${templateName} sent`,
            direction: 'outgoing',
            status: 'sent'
          }
        });
 
        results.push({ phoneNumber, success: true, messageId: response.data.messages[0].id });
      } catch (error) {
        console.error(`Failed to send to ${phoneNumber}:`, error.response?.data || error.message);
        results.push({ phoneNumber, success: false, error: error.message });
      }
    }
 
    return results;
    */
  }
 
  async sendBulkTemplateMessageWithNames(contacts: Array<{name: string; phone: string}>, templateName: string) {
    // TEMPORARILY DISABLED
    return [];
    /*
    const results: Array<{ phoneNumber: string; success: boolean; messageId?: string; error?: string }> = [];
   
    for (const contact of contacts) {
      const validationError = this.validatePhoneNumber(contact.phone);
      if (validationError) {
        results.push({ phoneNumber: contact.phone, success: false, error: validationError });
        continue;
      }
 
      try {
        const response = await axios.post(
          `${this.apiUrl}/${this.phoneNumberId}/messages`,
          {
            messaging_product: 'whatsapp',
            to: contact.phone,
            type: 'template',
            template: {
              name: templateName,
              language: { code: 'en' },
              components: contact.name ? [
                {
                  type: 'body',
                  parameters: [{ type: 'text', text: contact.name }]
                }
              ] : []
            }
          },
          {
            headers: {
              'Authorization': `Bearer ${this.accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
 
        await this.prisma.whatsappMessage.create({
          data: {
            messageId: response.data.messages[0].id,
            from: contact.phone,
            message: `Template ${templateName} sent to ${contact.name}`,
            direction: 'outgoing',
            status: 'sent'
          }
        });
 
        results.push({ phoneNumber: contact.phone, success: true, messageId: response.data.messages[0].id });
      } catch (error) {
        const errorMsg = this.getErrorMessage(error);
        console.error(`Failed to send to ${contact.phone}:`, errorMsg);
        results.push({ phoneNumber: contact.phone, success: false, error: errorMsg });
      }
    }
 
    return results;
    */
  }

 
  private validatePhoneNumber(phone: string): string | null {
    if (!phone || phone.trim() === '') {
      return 'Phone number is required';
    }
    const cleanPhone = phone.replace(/[^0-9]/g, '');
   
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      return 'Invalid phone number format';
    }
    if (!/^[1-9]/.test(cleanPhone)) {
      return 'Phone number cannot start with 0';
    }
   
    // Block repeated digits (1111111111, 2222222222, etc.)
    if (/^(\d)\1{9,}$/.test(cleanPhone)) {
      return 'Invalid phone number - not registered on WhatsApp';
    }
   
    // Block sequential numbers (1234567890, 0123456789)
    if (cleanPhone === '1234567890' || cleanPhone === '0123456789' ||
        cleanPhone === '9876543210' || cleanPhone === '0987654321') {
      return 'Invalid phone number - not registered on WhatsApp';
    }
   
    return null;
  }
 
  private getErrorMessage(error: any): string {
    if (error.response?.data?.error) {
      const apiError = error.response.data.error;
      if (apiError.code === 131026) {
        return 'Number not registered on WhatsApp';
      }
      if (apiError.code === 131047) {
        return 'Message failed to send - Invalid number';
      }
      if (apiError.code === 131051) {
        return 'Unsupported message type';
      }
      return apiError.message || 'WhatsApp API error';
    }
    return error.message || 'Failed to send message';
  }
 
  async sendOrderConfirmation(order: any) {
    // TEMPORARILY DISABLED
    return { success: true };
    /*
    const phoneNumber = order.shippingAddress.mobile;
    const name = order.shippingAddress.fullName;
 
    try {
      const response = await axios.post(
        `${this.apiUrl}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: phoneNumber,
          type: 'template',
          template: {
            name: 'order_status_en3',
            language: { code: 'en' },
            components: [
              {
                type: 'body',
                parameters: [
                  { type: 'text', text: name },
                  { type: 'text', text: `#ORD-${order.id}` },
                  { type: 'text', text: order.total },
                  { type: 'text', text: order.paymentMethod }
                ]
              }
            ]
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
 
      await this.prisma.whatsappMessage.create({
        data: {
          messageId: response.data.messages[0].id,
          from: phoneNumber,
          message: `Order ${order.id} confirmation sent`,
          direction: 'outgoing',
          status: 'sent'
        }
      });
 
      console.log(`WhatsApp message sent to ${phoneNumber}:`, response.data);
      return { success: true, messageId: response.data.messages[0].id };
    } catch (error) {
      console.error('WhatsApp API Error:', error.response?.data || error.message);
      return { success: false, error: error.message };
    }
    */
  }

  async sendOrderAccepted(order: any) {
    // TEMPORARILY DISABLED
    return { success: true };
    /*
    const phoneNumber = order.shippingAddress.mobile;
    const name = order.shippingAddress.fullName;

    try {
      const response = await axios.post(
        `${this.apiUrl}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: phoneNumber,
          type: 'template',
          template: {
            name: 'order_ready_to_ship',
            language: { code: 'en' },
            components: [
              {
                type: 'body',
                parameters: [
                  { type: 'text', text: name },
                  { type: 'text', text: `#ORD-${order.id}` }
                ]
              }
            ]
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      await this.prisma.whatsappMessage.create({
        data: {
          messageId: response.data.messages[0].id,
          from: phoneNumber,
          message: `Order ${order.id} accepted notification sent`,
          direction: 'outgoing',
          status: 'sent'
        }
      });

      console.log(`WhatsApp accepted message sent to ${phoneNumber}:`, response.data);
      return { success: true, messageId: response.data.messages[0].id };
    } catch (error) {
      console.error('WhatsApp API Error:', error.response?.data || error.message);
      return { success: false, error: error.message };
    }
    */
  }

  async sendOrderShipped(order: any, trackingInfo: { courier: string; trackingId: string; trackingUrl: string }, invoiceUrl: string) {
    // TEMPORARILY DISABLED
    return { success: true };
    /*
    const phoneNumber = order.shippingAddress.mobile;
    const name = order.shippingAddress.fullName;
 
    try {
      console.log('Original invoiceUrl received:', invoiceUrl);
      const invoiceFilename = invoiceUrl.includes('/') ? invoiceUrl.split('/').pop() : invoiceUrl;
      console.log('Extracted filename:', invoiceFilename);
      console.log('Sending to WhatsApp button parameter:', invoiceFilename);
      const response = await axios.post(
        `${this.apiUrl}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: phoneNumber,
          type: 'template',
          template: {
            name: 'order_shipped_invoice_v4',
            language: { code: 'en' },
            components: [
              {
                type: 'body',
                parameters: [
                  { type: 'text', text: name },
                  { type: 'text', text: `#ORD-${order.id}` },
                  { type: 'text', text: trackingInfo.courier },
                  { type: 'text', text: trackingInfo.trackingId },
                  { type: 'text', text: trackingInfo.trackingUrl }
                ]
              },
              {
                type: 'button',
                sub_type: 'url',
                index: 0,
                parameters: [
                  { type: 'text', text: invoiceFilename }
                ]
              }
            ]
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
 
      await this.prisma.whatsappMessage.create({
        data: {
          messageId: response.data.messages[0].id,
          from: phoneNumber,
          message: `Order ${order.id} shipped notification sent`,
          direction: 'outgoing',
          status: 'sent'
        }
      });
 
      console.log(`WhatsApp shipped message sent to ${phoneNumber}:`, response.data);
      console.log('Full request payload:', JSON.stringify({
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'template',
        template: {
          name: 'order_shipped_invoice_v1',
          language: { code: 'en' },
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: name },
                { type: 'text', text: order.id.toString() },
                { type: 'text', text: trackingInfo.courier },
                { type: 'text', text: trackingInfo.trackingId },
                { type: 'text', text: trackingInfo.trackingUrl }
              ]
            },
            {
              type: 'button',
              sub_type: 'url',
              index: 0,
              parameters: [
                { type: 'text', text: invoiceFilename }
              ]
            }
          ]
        }
      }, null, 2));
      return { success: true, messageId: response.data.messages[0].id };
    } catch (error) {
      console.error('WhatsApp API Error:', error.response?.data || error.message);
      return { success: false, error: error.message };
    }
    */
  }

  async sendOrderDelivered(order: any, invoiceUrl: string) {
    // TEMPORARILY DISABLED
    return { success: true };
    /*
    const phoneNumber = order.shippingAddress.mobile;
    const name = order.shippingAddress.fullName;
 
    try {
      const response = await axios.post(
        `${this.apiUrl}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: phoneNumber,
          type: 'template',
          template: {
            name: 'order_delivered_invoice',
            language: { code: 'en' },
            components: [
              {
                type: 'body',
                parameters: [
                  { type: 'text', text: name },
                  { type: 'text', text: `#ORD-${order.id}` },
                  { type: 'text', text: order.total },
                  { type: 'text', text: order.paymentMethod },
                  { type: 'text', text: invoiceUrl }
                ]
              }
            ]
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
 
      await this.prisma.whatsappMessage.create({
        data: {
          messageId: response.data.messages[0].id,
          from: phoneNumber,
          message: `Order ${order.id} delivered notification sent`,
          direction: 'outgoing',
          status: 'sent'
        }
      });
 
      console.log(`WhatsApp delivered message sent to ${phoneNumber}:`, response.data);
      return { success: true, messageId: response.data.messages[0].id };
    } catch (error) {
      console.error('WhatsApp API Error:', error.response?.data || error.message);
      return { success: false, error: error.message };
    }
    */
  }

  async sendLowStockAlert(phoneNumber: string, productDetails: string) {
    // TEMPORARILY DISABLED
    return { success: true };
    /*
    try {
      const response = await axios.post(
        `${this.apiUrl}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: phoneNumber,
          type: 'text',
          text: { body: `🚨 Low Stock Alert\n\n${productDetails}` }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      await this.prisma.whatsappMessage.create({
        data: {
          messageId: response.data.messages[0].id,
          from: phoneNumber,
          message: `Low stock alert sent`,
          direction: 'outgoing',
          status: 'sent'
        }
      });

      return { success: true, messageId: response.data.messages[0].id };
    } catch (error) {
      console.error('WhatsApp API Error:', error.response?.data || error.message);
      return { success: false, error: error.message };
    }
    */
  }

  async handleWhatsAppOrder(from: string, orderData: any, profileName: string = 'WhatsApp Customer') {
    console.log('WhatsApp Order Payload received:', JSON.stringify(orderData, null, 2));
    try {
      const items = orderData.product_items || [];
      console.log('Extracted product_items:', items);
      let total = 0;
      const orderItems: any[] = [];

      for (const item of items) {
         const retailerIdStr = item.product_retailer_id || item.item_retailer_id;
         console.log('Raw retailerId from payload:', retailerIdStr);
         
         const parts = retailerIdStr.split('_');
         const productId = parseInt(parts[0]);
         const variantId = parts.length > 1 ? parts.slice(1).join('_') : null;
         const qty = parseInt(item.quantity);
         console.log(`Parsed productId: ${productId}, variantId: ${variantId}, qty: ${qty}`);
         
         if (isNaN(productId)) {
            console.warn(`Invalid productId extracted: ${retailerIdStr}`);
            continue;
         }
         
         const product = await this.prisma.product.findUnique({ where: { id: productId } });
         if (product) {
            let variantName = product.name;
            let price = parseFloat(product.basePrice);
            let imageUrl = (product.gallery as any)?.[0]?.url || (product.colors as any)?.[0]?.image || '';
            let selectedColor = null;
            let selectedSize = null;

            if (variantId && product.colors) {
               const colors = product.colors as any[];
               let found = false;
               for (const color of colors) {
                  if (color.sizes) {
                     const size = color.sizes.find((s: any) => s.sizeVariantId === variantId || `${color.name}-${s.size}` === variantId);
                     if (size) {
                        variantName = `${product.name} - ${color.name} (${size.size})`;
                        price = parseFloat(size.price || product.basePrice);
                        imageUrl = color.image || imageUrl;
                        selectedColor = color.name;
                        selectedSize = size.size;
                        found = true;
                        break;
                     }
                  } else if (`${color.name}` === variantId) {
                     variantName = `${product.name} - ${color.name}`;
                     imageUrl = color.image || imageUrl;
                     selectedColor = color.name;
                     found = true;
                     break;
                  }
               }
               if (!found) {
                  console.warn(`Variant ${variantId} not found in product ${productId}`);
               }
            }

            console.log(`Product found in DB: ${variantName}`);
            total += price * qty;
            
            orderItems.push({
               productId: product.id,
               name: variantName,
               price: price.toString(),
               imageUrl: imageUrl,
               quantity: qty,
               color: selectedColor,
               size: selectedSize,
               colorVariantId: variantId,
               sizeVariantId: variantId
            });
         } else {
            console.warn(`Product ID ${productId} not found in Database!`);
         }
      }

      if (orderItems.length === 0) {
         console.warn('No valid orderItems could be processed from the cart. Ignoring.');
         return;
      }

      const checkoutData = {
        isCatalogOrder: true,
        items: orderItems,
        total: total,
        profileName: profileName
      };

      await this.prisma.whatsappSession.upsert({
        where: { phone: from },
        create: { phone: from, state: 'checkout_address', checkoutData },
        update: { state: 'checkout_address', checkoutData, categoryId: null, subCategoryId: null }
      });

      const itemCount = orderItems.length;
      const itemWord = itemCount === 1 ? 'item' : 'items';
      const msgText = `🛍️ Thank you! We received your WhatsApp Shopping Cart with **${itemCount} ${itemWord}**.`;
      const flowId = process.env.META_FLOW_ID;
      
      if (flowId && flowId !== 'YOUR_FLOW_ID') {
         await this.sendFlowMessage(from, msgText, flowId);
      } else {
         const fallbackMsg = `${msgText}\n \n📍 To place your order, please reply with your **complete delivery address**:\n \n• Full Name\n• Street / Area\n• City\n• State\n• Pincode\n \nWe'll process your order as soon as we receive your details. 😊`;
         await this.sendMessage(from, fallbackMsg);
      }
    } catch(err) {
      console.error('Error handling WhatsApp order:', err);
    }
  }

  async syncProductToCatalog(product: any, deleteProduct: boolean = false) {
    const catalogId = process.env.META_CATALOG_ID;
    if (!catalogId || catalogId === 'YOUR_CATALOG_ID_HERE') {
      console.warn('META_CATALOG_ID not set. Skipping catalog sync.');
      return { success: false, reason: 'No catalog ID' };
    }
    const accessToken = process.env.META_ACCESS_TOKEN;
    if (!accessToken || accessToken === 'YOUR_GENERATED_TOKEN') {
      console.warn('META_ACCESS_TOKEN not set. Skipping catalog sync.');
      return { success: false, reason: 'No access token' };
    }

    try {
      const url = `https://graph.facebook.com/v20.0/${catalogId}/items_batch`;
      const gallery = product.gallery as any;
      const colors = product.colors as any;
      const imageUrl = gallery?.[0]?.url || colors?.[0]?.image || '';
      
      let plainDescription = product.description || product.name;
      plainDescription = plainDescription.replace(/<\/(p|div|h[1-6])>/gi, '\n');
      plainDescription = plainDescription.replace(/<br\s*\/?>/gi, '\n');
      plainDescription = plainDescription.replace(/<[^>]*>?/gm, '');
      plainDescription = plainDescription.replace(/&nbsp;/gi, ' ')
                                         .replace(/&amp;/gi, '&')
                                         .replace(/&quot;/gi, '"')
                                         .replace(/&lt;/gi, '<')
                                         .replace(/&gt;/gi, '>');
      plainDescription = plainDescription.replace(/[ \t]+/g, ' ');
      plainDescription = plainDescription.replace(/\n\s*\n/g, '\n\n').trim();
      if (!plainDescription) plainDescription = product.name;
      
      const shouldDelete = deleteProduct || product.status === 'inactive';

      const requests: any[] = [];
      
      if (!colors || colors.length === 0) {
         requests.push({
            method: shouldDelete ? 'DELETE' : 'UPDATE',
            retailer_id: product.id.toString(),
            data: shouldDelete ? { id: product.id.toString() } : {
              id: product.id.toString(),
              item_group_id: product.id.toString(),
              availability: 'in stock',
              condition: 'new',
              description: plainDescription,
              image_link: imageUrl,
              link: `${process.env.FRONTEND_URL || 'https://dailykurtis.com'}/product/item-${product.id}`,
              title: product.name,
              price: `${product.mrp || product.basePrice || '0'} INR`,
              sale_price: `${product.basePrice || '0'} INR`,
              inventory: 100,
              brand: 'Daily Kurtis',
            }
         });
      } else {
         // Attempt to delete the old standalone product to avoid duplicates
         requests.push({
            method: 'DELETE',
            retailer_id: product.id.toString(),
            data: { id: product.id.toString() }
         });

         for (const color of colors) {
            const colorName = (color.name || 'Unknown').trim();
            const colorImage = color.image || imageUrl;
            
            if (color.sizes && color.sizes.length > 0) {
               for (const size of color.sizes) {
                  const sizeName = (size.size || 'One Size').trim();
                  const price = size.price || product.basePrice;
                  const variantId = (size.sizeVariantId || `${colorName}-${sizeName}`).trim();
                  const retailerId = `${product.id}_${variantId}`;
                  
                  requests.push({
                    method: shouldDelete ? 'DELETE' : 'UPDATE',
                    retailer_id: retailerId,
                    data: shouldDelete ? { id: retailerId } : {
                      id: retailerId,
                      item_group_id: product.id.toString(),
                      availability: 'in stock',
                      condition: 'new',
                      description: plainDescription,
                      image_link: colorImage,
                      link: `${process.env.FRONTEND_URL || 'https://dailykurtis.com'}/product/item-${product.id}?variant=${variantId}`,
                      title: `${product.name} - ${colorName} (${sizeName})`,
                      price: `${price} INR`,
                      sale_price: `${price} INR`,
                      inventory: size.quantity > 0 ? size.quantity : 0,
                      brand: 'Daily Kurtis',
                      color: colorName,
                      size: sizeName,
                    }
                  });
               }
            } else {
               const variantId = `${colorName}`.trim();
               const retailerId = `${product.id}_${variantId}`;
               requests.push({
                 method: shouldDelete ? 'DELETE' : 'UPDATE',
                 retailer_id: retailerId,
                 data: shouldDelete ? { id: retailerId } : {
                   id: retailerId,
                   item_group_id: product.id.toString(),
                   availability: 'in stock',
                   condition: 'new',
                   description: plainDescription,
                   image_link: colorImage,
                   link: `${process.env.FRONTEND_URL || 'https://dailykurtis.com'}/product/item-${product.id}?variant=${variantId}`,
                   title: `${product.name} - ${colorName}`,
                   price: `${product.basePrice} INR`,
                   sale_price: `${product.basePrice} INR`,
                   inventory: 100,
                   brand: 'Daily Kurtis',
                   color: colorName,
                 }
               });
            }
         }
      }

      const requestBody = {
        item_type: 'PRODUCT_ITEM',
        requests
      };
      
      const response = await axios.post(url, requestBody, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      console.log('Catalog sync response:', JSON.stringify(response.data, null, 2));
      return { success: true, data: response.data };
    } catch(err: any) {
      console.error('Catalog sync error:', err.response?.data || err.message);
      return { success: false, error: err.message };
    }
  }
}