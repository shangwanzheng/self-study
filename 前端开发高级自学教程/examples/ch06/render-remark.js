const remark = order.remark; // 不可信字符串
remarkNode.textContent = remark; // 当文本显示

// 不要这样做：remarkNode.innerHTML = remark;
