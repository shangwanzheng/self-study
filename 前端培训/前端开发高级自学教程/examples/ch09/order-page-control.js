function orderPageControl(copied) {
  return {
    layer: copied ? '业务页自绘' : '基础组件',
    copied: !!copied
  };
}
