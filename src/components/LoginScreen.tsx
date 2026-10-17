import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import Papa from 'papaparse';
import { CONFIG } from '../config';

export default function LoginScreen() {
  const [matricula, setMatricula] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState<{ nome: string } | null>(null);

  const verifyMatricula = async (mat: string) => {
    if (!mat.trim()) return;

    setLoading(true);
    setError('');
    setSuccessData(null);

    try {
      const csvUrl = `https://docs.google.com/spreadsheets/d/${CONFIG.sheetId}/export?format=csv&t=${Date.now()}`;
      const response = await fetch(csvUrl);
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('A planilha está privada. Mude o Compartilhamento no Google Sheets para "Qualquer pessoa com o link".');
        }
        throw new Error('Falha ao acessar a planilha de dados. Verifique a planilha.');
      }

      const csvText = await response.text();
      const parsed = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
      });

      const data = parsed.data as any[];
      
      const user = data.find((row) => {
        const rowMatricula = row['Matrícula'] || row['Matricula'] || row['MATRICULA'] || row['id'] || row['ID'];
        return String(rowMatricula).trim() === String(mat).trim();
      });

      if (user) {
        const nome = user['Nome'] || user['NOME'] || user['Name'] || user['Aluno'] || "Usuário";
        setSuccessData({ nome });
        localStorage.setItem('userMatricula', mat);
      } else {
        setError('Matrícula não encontrada. Verifique e tente novamente.');
        localStorage.removeItem('userMatricula');
      }
    } catch (err: any) {
      console.error(err);
      let errMsg = err.message || 'Erro de conexão. Verifique sua internet.';
      if (err instanceof TypeError || errMsg.toLowerCase().includes('failed to fetch') || errMsg.toLowerCase().includes('fetch')) {
        errMsg = 'Acesso negado ou sem conexão. Certifique-se de que a planilha do Google Sheets está configurada com compartilhamento "Qualquer pessoa com o link" (Leitor).';
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedMatricula = localStorage.getItem('userMatricula');
    if (savedMatricula) {
      setMatricula(savedMatricula);
      verifyMatricula(savedMatricula);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    verifyMatricula(matricula);
  };

  return (
    <div className="w-full max-w-md relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "circOut" }}
        className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl shadow-2xl shadow-slate-200/50 overflow-hidden"
      >
        {/* Header */}
        <div className="p-8 pb-0 text-center">
          <div className="mb-6">
            <img src={CONFIG.logoUrl} alt="Logo" className="w-24 h-24 mx-auto object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">{CONFIG.appName}</h1>
          <p className="text-slate-500 text-sm">Digite sua matrícula para continuar</p>
        </div>

        {/* Body */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            {successData ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-4"
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="mx-auto w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 border border-emerald-200"
                >
                  <CheckCircle2 size={40} />
                </motion.div>
                <h2 className="text-2xl font-semibold text-slate-900 mb-2">
                  Bem vindo(a),<br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                    {successData.nome}
                  </span>
                </h2>
                <p className="text-slate-500 mb-8">
                  Autenticação realizada com sucesso!
                </p>
                
                <button
                  onClick={() => window.location.href = CONFIG.redirectUrl}
                  className="w-full relative group overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium py-4 px-4 rounded-2xl transition-all duration-300 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 mb-4 cursor-pointer"
                >
                  <span>Acessar Sistema</span>
                  <ArrowRight size={20} />
                </button>

                <button
                  onClick={() => {
                    localStorage.removeItem('userMatricula');
                    setSuccessData(null);
                    setMatricula('');
                  }}
                  className="text-sm text-slate-500 hover:text-slate-700 underline underline-offset-4 transition-colors cursor-pointer"
                >
                  Trocar de usuário
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label 
                    htmlFor="matricula" 
                    className="block text-xs font-medium text-slate-500 uppercase tracking-wider ml-1"
                  >
                    Matrícula
                  </label>
                  <div className="relative group">
                    <input
                      id="matricula"
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={matricula}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setMatricula(val);
                      }}
                      placeholder="Ex: 123456"
                      className="w-full px-4 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all duration-300"
                      disabled={loading}
                      autoComplete="off"
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500" />
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 text-red-600 text-sm bg-red-50 border border-red-100 p-4 rounded-xl text-left"
                  >
                    <AlertCircle size={18} className="shrink-0 animate-bounce" />
                    <span>{error}</span>
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full relative group overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-4 px-4 rounded-2xl transition-all duration-300 shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <span className="relative flex items-center gap-2">
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Verificando...
                      </>
                    ) : (
                      <>
                        Acessar Sistema
                        <ArrowRight size={20} />
                      </>
                    )}
                  </span>
                </button>

                <div className="text-center pt-2">
                  <span className="text-sm text-slate-500">Não tem acesso? </span>
                  <a
                    href={CONFIG.supportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 underline underline-offset-4 transition-colors"
                  >
                    Clique aqui
                  </a>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
        
        {/* Footer */}
        {!successData && (
          <div className="p-6 text-center border-t border-slate-100 bg-slate-50/50">
            <p className="text-xs text-slate-400">
              &copy; {new Date().getFullYear()} {CONFIG.appName}. Todos os direitos reservados.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
