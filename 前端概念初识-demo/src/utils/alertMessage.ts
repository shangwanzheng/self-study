import { message } from 'antd';

export const alertMessage = {
  success(options: { content: string }) {
    message.success(options.content);
  },
  error(options: { content: string }) {
    message.error(options.content);
  },
};
