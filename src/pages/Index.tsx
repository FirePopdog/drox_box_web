import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { ArrowRight, CloudUpload, Download, Shield, Zap } from 'lucide-react';

const features = [
  {
    icon: CloudUpload,
    title: '快速上傳',
    description: '支援拖放上傳，輕鬆管理各種檔案格式',
  },
  {
    icon: Download,
    title: '即時下載',
    description: '高速下載通道，隨時隨地存取您的檔案',
  },
  {
    icon: Shield,
    title: '安全可靠',
    description: '企業級安全防護，保障您的檔案安全',
  },
  {
    icon: Zap,
    title: '極速體驗',
    description: '優化的傳輸協議，提供流暢的使用體驗',
  },
];

export default function Index() {
  return (
    <div className="min-h-screen gradient-hero">
      <Header />
      
      {/* Hero Section */}
      <section className="container py-20 md:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <div className="animate-slide-up">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Zap className="h-4 w-4" />
              簡單、快速、安全的檔案分享平台
            </div>
            
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              雲端檔案庫
              <span className="mt-2 block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                輕鬆管理您的檔案
              </span>
            </h1>
            
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
              一站式檔案管理解決方案，支援多種格式上傳與下載。
              無論是文件、圖片還是壓縮檔，都能安全存放。
            </p>
            
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/files">
                <Button variant="hero" size="xl" className="gap-2">
                  瀏覽檔案
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="outline" size="xl">
                  登入管理
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-border/50 bg-card/50 py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              為什麼選擇我們？
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              我們提供完整的檔案管理功能，滿足您的各種需求
            </p>
          </div>
          
          <div className="mx-auto mt-16 grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group rounded-2xl bg-card p-6 shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary text-primary-foreground transition-transform duration-300 group-hover:scale-110">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl gradient-primary p-8 text-center shadow-glow md:p-12">
            <h2 className="text-2xl font-bold text-primary-foreground sm:text-3xl">
              準備好開始了嗎？
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
              立即瀏覽我們的檔案庫，或登入管理您的檔案
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/files">
                <Button variant="secondary" size="lg" className="bg-card text-foreground hover:bg-card/90">
                  立即瀏覽
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2024 雲端檔案庫. 保留所有權利.</p>
        </div>
      </footer>
    </div>
  );
}
