import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class MetaConversionsService {
  private readonly logger = new Logger(MetaConversionsService.name);
  
  private hashData(data: string): string {
    if (!data) return '';
    return crypto.createHash('sha256').update(data.trim().toLowerCase()).digest('hex');
  }

  async sendPurchaseEvent(order: any, user: any) {
    const datasetId = process.env.META_DATASET_ID;
    const accessToken = process.env.META_ACCESS_TOKEN;

    if (!datasetId || !accessToken || accessToken === 'YOUR_GENERATED_TOKEN') {
      this.logger.warn('Meta CAPI not configured properly. Missing META_DATASET_ID or META_ACCESS_TOKEN.');
      return;
    }

    try {
      const contentIds = order.orderItems.map(item => item.productId.toString());
      
      const payload = {
        data: [
          {
            event_name: 'Purchase',
            event_time: Math.floor(Date.now() / 1000),
            action_source: 'website',
            event_source_url: 'https://dailykurtis.com',
            user_data: {
              em: [this.hashData(user.email)],
              ph: [this.hashData(user.phone || order.shippingAddress?.mobile)]
            },
            custom_data: {
              currency: 'INR',
              value: order.totalAmount,
              content_ids: contentIds,
              content_type: 'product'
            },
            event_id: `ORDER_${order.id}`
          }
        ],
        access_token: accessToken
      };

      const url = `https://graph.facebook.com/v20.0/${datasetId}/events`;
      const response = await axios.post(url, payload);
      this.logger.log(`Successfully sent CAPI Purchase event for order ${order.id}. FB Response: ${JSON.stringify(response.data)}`);
    } catch (error) {
      this.logger.error(`Failed to send CAPI Purchase event for order ${order.id}:`, error?.response?.data || error.message);
    }
  }
}
