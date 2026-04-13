import { v4 as uuidv4 } from 'uuid';

export const generateId = (): string => uuidv4();

export const generateNoOrder = (): string => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD/${dateStr}/${randomNum}`;
};

export const generateNoPKS = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `PKS/${year}/${randomNum}`;
};

export const generateNoTransaksi = (): string => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `TRX/${dateStr}/${randomNum}`;
};

export const generateNoRetur = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `RTR/${year}/${randomNum}`;
};
