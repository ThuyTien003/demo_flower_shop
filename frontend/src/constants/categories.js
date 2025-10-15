import { FaLeaf, FaRing, FaGift, FaSpa, FaSeedling } from 'react-icons/fa';

export const CATEGORY_CONFIG = {
  'hoa cưới': {
    icon: FaRing,
    color: '#d63384',
    image: 'https://bizweb.dktcdn.net/100/487/411/themes/957692/assets/cate_5.png?1757405855081'
  },
  'hoa khai trương': {
    icon: FaGift,
    color: '#f59f00',
    image: 'https://bizweb.dktcdn.net/100/487/411/themes/957692/assets/cate_2.png?1757405855081'
  },
  'hoa sáp': {
    icon: FaSpa,
    color: '#845ef7',
    image: 'https://bizweb.dktcdn.net/100/487/411/themes/957692/assets/cate_4.png?1757405855081'
  },
  'bó hoa tươi': {
    icon: FaSeedling,
    color: '#2f9e44',
    image: 'https://bizweb.dktcdn.net/100/487/411/themes/957692/assets/cate_1.png?1757405855081'
  }
};

export const getCategoryIcon = (name = '') => {
  const n = name.toLowerCase();
  for (const [key, config] of Object.entries(CATEGORY_CONFIG)) {
    if (n.includes(key)) return config.icon;
  }
  return FaLeaf;
};

export const getCategoryColor = (name = '') => {
  const n = name.toLowerCase();
  for (const [key, config] of Object.entries(CATEGORY_CONFIG)) {
    if (n.includes(key)) return config.color;
  }
  return '#0ea5e9';
};

export const getCategoryImage = (category = {}) => {
  const n = (category.name || '').toLowerCase();
  for (const [key, config] of Object.entries(CATEGORY_CONFIG)) {
    if (n === key || n.includes(key)) return config.image;
  }
  return category.thumbnail || category.image || category.image_url || '';
};
