import React, { useState, useEffect } from 'react';

declare global {
  interface Window {
    h5sdk: any;
  }
}

const App: React.FC = () => {
  const [config, setConfig] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [data, setData] = useState<any>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // 检查是否在飞书环境中
    if (!window.h5sdk) {
      console.log('未在飞书环境中运行，使用模拟数据');
      setData({ 销售额: 150000, 订单数: 320, 客户数: 85 });
      setConfig({
        title: '销售数据指标卡',
        metric: '销售额',
        aggregation: 'sum',
        unit: '元'
      });
      return;
    }

    // 初始化飞书SDK
    window.h5sdk.ready(() => {
      console.log('飞书SDK已就绪');
      
      // 获取配置
      const urlParams = new URLSearchParams(window.location.search);
      const configStr = urlParams.get('config');
      if (configStr) {
        try {
          setConfig(JSON.parse(decodeURIComponent(configStr)));
        } catch (e) {
          console.error('配置解析失败', e);
        }
      }
    });
  }, []);

  // 模拟指标卡计算
  const calculateMetric = () => {
    if (!config || !data) return 0;
    
    const value = data[config.metric] || 0;
    
    switch (config.aggregation) {
      case 'sum':
        return value;
      case 'avg':
        return records.length > 0 ? value / records.length : 0;
      case 'count':
        return records.length;
      case 'max':
        return value;
      case 'min':
        return value;
      default:
        return value;
    }
  };

  const formatValue = (value: number) => {
    if (!config) return value;
    switch (config.unit) {
      case '元':
        return `¥${value.toLocaleString()}`;
      case '万':
        return `${(value / 10000).toFixed(2)}万`;
      case '%':
        return `${value.toFixed(2)}%`;
      default:
        return value.toLocaleString();
    }
  };

  if (!mounted) return null;

  return (
    <div className="metric-card">
      <div className="metric-header">
        {config?.title || '指标卡'}
      </div>
      <div className="metric-value">
        {formatValue(calculateMetric())}
      </div>
      <div className="metric-label">
        {config?.aggregation === 'sum' ? '总计' : 
         config?.aggregation === 'avg' ? '平均' :
         config?.aggregation === 'count' ? '计数' : ''} {config?.metric}
      </div>
    </div>
  );
};

export default App;
