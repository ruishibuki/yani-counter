import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';

const STORAGE_KEYS = {
  count: 'yani-counter:count',
  lastSmokedAt: 'yani-counter:last-smoked-at',
  image: 'yani-counter:image',
  title: 'yani-counter:title',
} as const;

const DEFAULT_TITLE = 'Yani Counter';

const pad = (value: number) => String(value).padStart(2, '0');

const formatElapsed = (elapsedMs: number) => {
  const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

const readNumber = (key: string) => {
  const value = localStorage.getItem(key);
  const parsed = value === null ? NaN : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

function App() {
  const [count, setCount] = useState(() => readNumber(STORAGE_KEYS.count) ?? 0);
  const [lastSmokedAt, setLastSmokedAt] = useState<number | null>(() =>
    readNumber(STORAGE_KEYS.lastSmokedAt),
  );
  const [uploadedImage, setUploadedImage] = useState(
    () => localStorage.getItem(STORAGE_KEYS.image) ?? '',
  );
  const [title, setTitle] = useState(
    () => localStorage.getItem(STORAGE_KEYS.title) ?? DEFAULT_TITLE,
  );
  const [now, setNow] = useState(() => Date.now());
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.count, String(count));
  }, [count]);

  useEffect(() => {
    if (lastSmokedAt === null) {
      localStorage.removeItem(STORAGE_KEYS.lastSmokedAt);
      return;
    }

    localStorage.setItem(STORAGE_KEYS.lastSmokedAt, String(lastSmokedAt));
  }, [lastSmokedAt]);

  useEffect(() => {
    if (uploadedImage) {
      localStorage.setItem(STORAGE_KEYS.image, uploadedImage);
      return;
    }

    localStorage.removeItem(STORAGE_KEYS.image);
  }, [uploadedImage]);

  useEffect(() => {
    const trimmedTitle = title.trim();

    if (trimmedTitle && trimmedTitle !== DEFAULT_TITLE) {
      localStorage.setItem(STORAGE_KEYS.title, title);
      return;
    }

    localStorage.removeItem(STORAGE_KEYS.title);
  }, [title]);

  useEffect(() => {
    const timerId = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timerId);
  }, []);

  const elapsedTime = useMemo(() => {
    if (lastSmokedAt === null) {
      return '--:--:--';
    }

    return formatElapsed(now - lastSmokedAt);
  }, [lastSmokedAt, now]);

  const handleAddSmoke = () => {
    setCount((current) => current + 1);
    setLastSmokedAt(Date.now());
  };

  const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.addEventListener('load', () => {
      if (typeof reader.result === 'string') {
        setUploadedImage(reader.result);
      }
    });
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleReset = () => {
    setCount(0);
    setLastSmokedAt(null);
    setUploadedImage('');
    setTitle(DEFAULT_TITLE);
  };

  return (
    <main className="app-shell">
      <div className="background-decor background-decor-top">✦</div>
      <div className="background-decor background-decor-bottom">✧</div>

      <section className="counter-layout" aria-label="タバコ本数カウンター">
        <div className="title-ribbon">
          <input
            className="title-input"
            type="text"
            value={title}
            aria-label="タイトル"
            maxLength={24}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>

        <article className="main-card">
          <div className="card-stitch" aria-hidden="true" />

          <div className="illustration-panel">
            <div className="sparkle sparkle-one">★</div>
            <div className="sparkle sparkle-two">✦</div>
            {uploadedImage ? (
              <img className="uploaded-image" src={uploadedImage} alt="アップロードしたイラスト" />
            ) : (
              <div className="placeholder-art" aria-label="イラスト未設定">
                <div className="soft-cloud">
                  <span className="paw-print" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                    <span />
                  </span>
                  <span className="tiny-star">★</span>
                  <span className="placeholder-text">Illust</span>
                </div>
              </div>
            )}
          </div>

          <div className="stats-panel">
            <div className="stat-box">
              <span className="stat-label">吸った本数</span>
              <strong className="stat-number">{count}</strong>
              <span className="stat-unit">本</span>
            </div>

            <div className="stat-box elapsed-box">
              <span className="stat-label">前回から</span>
              <strong className="elapsed-time">{elapsedTime}</strong>
              <span className="stat-note">{lastSmokedAt === null ? 'まだ記録なし' : '経過中'}</span>
            </div>
          </div>
        </article>

        <div className="action-area">
          <button className="primary-button" type="button" onClick={handleAddSmoke}>
            ＋ 1本吸ったよ
          </button>

          <input
            ref={fileInputRef}
            className="visually-hidden"
            type="file"
            accept="image/*"
            onChange={handleUpload}
          />
          <button
            className="secondary-button"
            type="button"
            onClick={() => fileInputRef.current?.click()}
          >
            イラストをアップロード
          </button>

          <button className="reset-button" type="button" onClick={handleReset}>
            リセット
          </button>
        </div>
      </section>
    </main>
  );
}

export default App;
