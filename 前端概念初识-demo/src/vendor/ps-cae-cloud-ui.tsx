import type { ButtonProps } from 'antd';
import { Button } from 'antd';

/**
 * 本仓的 PsButton 从 @pscae/ps-cae-cloud-ui 引入。
 * 这里是演示替身，外观用线框主按钮，让课堂上能和 antd Button 分开。
 */
export function PsButton(props: ButtonProps) {
  return <Button type="primary" ghost {...props} />;
}
