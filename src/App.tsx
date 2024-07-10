import './App.css';
import { useEffect } from 'react';
import { bitable, UIBuilder } from "@lark-base-open/js-sdk";
import callback from './main';
import { useTranslation } from 'react-i18next';
import './i18n'; // 取消注释以启用国际化

export default function App() {
  const translation = useTranslation();
  useEffect(() => {
    const uiBuilder = new UIBuilder(document.querySelector('#container') as HTMLElement, {
      bitable,
      callback,
      translation,
    });
    return () => {
      uiBuilder.unmount();
    };
  }, [translation]);
  return (
    <div id='container'></div>
  );
}