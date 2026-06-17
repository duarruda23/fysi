"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { useStore } from "@/lib/store";
import type { Peca, VariacaoPeca, Tamanho } from "@/lib/types";

const TAMANHOS: Tamanho[] = ["PP", "P", "M", "G", "GG", "XG"];

export default function AdminPieceEditorPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { pecas, addPeca, updatePeca, categorias } = useStore();

  const catNames = useMemo(() => categorias.map(c => c.nome), [categorias]);

  const isEditMode = params.id !== "nova";

  // Locate the target piece if in edit mode
  const pecaToEdit = useMemo(() => {
    if (!isEditMode) return null;
    return pecas.find((p) => p.id === params.id) || null;
  }, [pecas, params.id, isEditMode]);

  // Form Field States
  const [nome, setNome] = useState("");
  const [referencia, setReferencia] = useState("");
  const [categoria, setCategoria] = useState("");
  const [novaCategoria, setNovaCategoria] = useState("");
  const [useCustomCategory, setUseCustomCategory] = useState(false);
  const [preco, setPreco] = useState<number>(0);
  const [descricao, setDescricao] = useState("");
  const [fotosInput, setFotosInput] = useState("");
  const [ativo, setAtivo] = useState(true);

  // Variations States
  const [variacoes, setVariacoes] = useState<VariacaoPeca[]>([]);

  // Inline variation form states
  const [varCor, setVarCor] = useState("");
  const [varCorHex, setVarCorHex] = useState("#ffffff");
  const [varTamanho, setVarTamanho] = useState<Tamanho>("M");
  const [varEstoque, setVarEstoque] = useState<number>(10);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load existing piece data
  useEffect(() => {
    if (isEditMode && pecaToEdit) {
      setNome(pecaToEdit.nome);
      setReferencia(pecaToEdit.referencia);
      setDescricao(pecaToEdit.descricao);
      setPreco(pecaToEdit.preco);
      setFotosInput(pecaToEdit.fotos.join(", "));
      setAtivo(pecaToEdit.ativo);
      setVariacoes(pecaToEdit.variacoes);
      
      if (catNames.includes(pecaToEdit.categoria)) {
        setCategoria(pecaToEdit.categoria);
        setUseCustomCategory(false);
      } else {
        setCategoria("custom");
        setNovaCategoria(pecaToEdit.categoria);
        setUseCustomCategory(true);
      }
    }
  }, [isEditMode, pecaToEdit, catNames]);

  // Handle adding a variation
  const handleAddVariation = () => {
    const corTrimmed = varCor.trim();
    if (!corTrimmed) {
      alert("Por favor, digite o nome da cor.");
      return;
    }

    // Check if combo Cor + Tamanho already exists
    const duplicate = variacoes.some(
      (v) => v.cor.toLowerCase() === corTrimmed.toLowerCase() && v.tamanho === varTamanho
    );

    if (duplicate) {
      alert("Já existe uma variação com esta mesma Cor e Tamanho.");
      return;
    }

    const newVar: VariacaoPeca = {
      id: `var-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      cor: corTrimmed,
      corHex: varCorHex,
      tamanho: varTamanho,
      quantidadeEstoque: Math.max(0, varEstoque)
    };

    setVariacoes((prev) => [...prev, newVar]);
    // Reset variation fields partially
    setVarEstoque(10);
  };

  // Handle removing a variation
  const handleRemoveVariation = (id: string) => {
    setVariacoes((prev) => prev.filter((v) => v.id !== id));
  };

  // Validation
  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!nome.trim()) newErrors.nome = "Nome da peça é obrigatório";
    if (!referencia.trim()) newErrors.referencia = "Referência / SKU é obrigatório";
    
    const finalCat = useCustomCategory ? novaCategoria : categoria;
    if (!finalCat || !finalCat.trim()) {
      newErrors.categoria = "Categoria é obrigatória";
    }
    
    if (preco <= 0) newErrors.preco = "O preço deve ser maior que zero";
    if (!descricao.trim()) newErrors.descricao = "A descrição é obrigatória";
    if (variacoes.length === 0) {
      newErrors.variacoes = "Adicione pelo menos uma variação de cor/tamanho";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit form
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Parse photos input
    const fotos = fotosInput
      .split(",")
      .map((url) => url.trim())
      .filter((url) => url !== "");

    // Fallback photo
    if (fotos.length === 0) {
      fotos.push("/brand/logo-preto.png");
    }

    const finalCat = useCustomCategory ? novaCategoria : categoria;

    const pecaData = {
      nome,
      referencia,
      categoria: finalCat,
      preco,
      descricao,
      fotos,
      ativo,
      variacoes
    };

    if (isEditMode && pecaToEdit) {
      await updatePeca(pecaToEdit.id, pecaData);
    } else {
      await addPeca(pecaData);
    }

    router.push("/admin/pecas");
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <Link
          href="/admin/pecas"
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-coal/60 hover:text-ink transition-colors"
        >
          <ArrowLeft size={14} /> Voltar para listagem
        </Link>
        <h2 className="mt-2 font-serif text-2xl font-bold tracking-tight text-ink md:text-3xl">
          {isEditMode ? `Editar Peça: ${pecaToEdit?.nome}` : "Cadastrar Nova Peça"}
        </h2>
      </div>

      <form onSubmit={handleSave} className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* Left Side: Metadata Fields */}
        <div className="bg-white rounded-xl border border-ink/10 p-6 space-y-5 shadow-line">
          <h3 className="font-serif text-lg font-bold text-ink border-b border-ink/10 pb-3">
            Informações Gerais
          </h3>

          {/* Nome */}
          <div className="space-y-1.5">
            <label htmlFor="nome" className="text-xs font-semibold uppercase tracking-wider text-coal/65">
              Nome da Peça *
            </label>
            <input
              type="text"
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Camisa Linho Breeze"
              className={`w-full h-10 px-3 rounded-md border text-sm text-ink outline-none ${
                errors.nome ? "border-clay bg-clay/5" : "border-ink/10 focus:border-ink"
              }`}
            />
            {errors.nome && <p className="text-xs text-clay font-medium">{errors.nome}</p>}
          </div>

          {/* Referencia (SKU) & Preço */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* SKU */}
            <div className="space-y-1.5">
              <label htmlFor="referencia" className="text-xs font-semibold uppercase tracking-wider text-coal/65">
                Referência / SKU *
              </label>
              <input
                type="text"
                id="referencia"
                value={referencia}
                onChange={(e) => setReferencia(e.target.value)}
                placeholder="Ex: FYS-1007"
                className={`w-full h-10 px-3 rounded-md border text-sm text-ink outline-none uppercase ${
                  errors.referencia ? "border-clay bg-clay/5" : "border-ink/10 focus:border-ink"
                }`}
              />
              {errors.referencia && <p className="text-xs text-clay font-medium">{errors.referencia}</p>}
            </div>

            {/* Price */}
            <div className="space-y-1.5">
              <label htmlFor="preco" className="text-xs font-semibold uppercase tracking-wider text-coal/65">
                Preço de Venda (R$) *
              </label>
              <input
                type="number"
                id="preco"
                min="0"
                step="0.01"
                value={preco || ""}
                onChange={(e) => setPreco(Number(e.target.value))}
                placeholder="Ex: 249.90"
                className={`w-full h-10 px-3 rounded-md border text-sm text-ink outline-none ${
                  errors.preco ? "border-clay bg-clay/5" : "border-ink/10 focus:border-ink"
                }`}
              />
              {errors.preco && <p className="text-xs text-clay font-medium">{errors.preco}</p>}
            </div>
          </div>

          {/* Categoria */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-coal/65 block">
              Categoria *
            </label>
            <div className="flex gap-4 items-center mb-2">
              <label className="flex items-center gap-1.5 text-xs text-coal cursor-pointer">
                <input
                  type="radio"
                  checked={!useCustomCategory}
                  onChange={() => {
                    setUseCustomCategory(false);
                    setCategoria(catNames[0] || "");
                  }}
                  className="accent-gold"
                />
                Selecionar Padrão
              </label>
              <label className="flex items-center gap-1.5 text-xs text-coal cursor-pointer">
                <input
                  type="radio"
                  checked={useCustomCategory}
                  onChange={() => {
                    setUseCustomCategory(true);
                    setCategoria("custom");
                  }}
                  className="accent-gold"
                />
                Digitar Nova Categoria
              </label>
            </div>

            {!useCustomCategory ? (
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className={`w-full h-10 px-3 rounded-md border bg-white text-sm text-ink outline-none ${
                  errors.categoria ? "border-clay" : "border-ink/10 focus:border-ink"
                }`}
              >
                <option value="">Selecione uma categoria...</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.nome}>
                    {c.nome}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={novaCategoria}
                onChange={(e) => setNovaCategoria(e.target.value)}
                placeholder="Digite a nova categoria..."
                className={`w-full h-10 px-3 rounded-md border text-sm text-ink outline-none ${
                  errors.categoria ? "border-clay bg-clay/5" : "border-ink/10 focus:border-ink"
                }`}
              />
            )}
            {errors.categoria && <p className="text-xs text-clay font-medium">{errors.categoria}</p>}
          </div>

          {/* Descrição */}
          <div className="space-y-1.5">
            <label htmlFor="descricao" className="text-xs font-semibold uppercase tracking-wider text-coal/65">
              Descrição da Peça *
            </label>
            <textarea
              id="descricao"
              rows={4}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Detalhes sobre tecido, caimento, botões e instruções de lavagem..."
              className={`w-full p-3 rounded-md border text-sm text-ink outline-none resize-none ${
                errors.descricao ? "border-clay bg-clay/5" : "border-ink/10 focus:border-ink"
              }`}
            />
            {errors.descricao && <p className="text-xs text-clay font-medium">{errors.descricao}</p>}
          </div>

          {/* Fotos URLs */}
          <div className="space-y-1.5">
            <label htmlFor="fotos" className="text-xs font-semibold uppercase tracking-wider text-coal/65">
              Foto URL (Mock de upload - separe múltiplas por vírgula)
            </label>
            <input
              type="text"
              id="fotos"
              value={fotosInput}
              onChange={(e) => setFotosInput(e.target.value)}
              placeholder="Ex: /brand/perfil-1.png, /brand/perfil-2.png"
              className="w-full h-10 px-3 rounded-md border border-ink/10 text-sm text-ink outline-none focus:border-ink"
            />
            <p className="text-[10px] text-coal/45">
              Dica: você pode utilizar fotos já mockadas como `/brand/perfil-1.png` até `/brand/perfil-6.png`.
            </p>
          </div>

          {/* Ativo Status Toggle */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="ativo"
              checked={ativo}
              onChange={(e) => setAtivo(e.target.checked)}
              className="h-4 w-4 rounded border-ink/10 text-gold accent-gold focus:ring-gold"
            />
            <label htmlFor="ativo" className="text-xs font-semibold uppercase tracking-wider text-coal/65 cursor-pointer">
              Disponibilizar peça para venda no e-commerce (Ativo)
            </label>
          </div>

          {/* Form CTAs */}
          <div className="pt-4 border-t border-ink/10 flex gap-3">
            <Link
              href="/admin/pecas"
              className="h-11 border border-ink/15 hover:bg-pearl text-ink font-semibold rounded-md px-5 text-sm flex items-center justify-center transition-all"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              className="flex-1 h-11 bg-ink hover:bg-coal text-white font-semibold rounded-md flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              <CheckCircle2 size={16} />
              <span>Salvar Peça</span>
            </button>
          </div>
        </div>

        {/* Right Side: Variations Builder */}
        <div className="bg-white rounded-xl border border-ink/10 p-5 space-y-5 shadow-line self-start">
          <div>
            <h3 className="font-serif text-lg font-bold text-ink">Variações de Estoque</h3>
            <p className="text-xs text-coal/55">Adicione combinações de Cor e Tamanho</p>
          </div>

          {errors.variacoes && (
            <div className="rounded border border-clay/20 bg-clay/5 p-3 flex items-center gap-2 text-clay text-xs">
              <AlertCircle size={14} className="shrink-0" />
              <span>{errors.variacoes}</span>
            </div>
          )}

          {/* New Variation Inputs block */}
          <div className="border border-ink/8 rounded-lg p-4 space-y-4 bg-pearl/10">
            <p className="text-xs font-bold text-ink uppercase tracking-wider">Nova Variação</p>
            
            {/* Cor */}
            <div className="grid grid-cols-[1fr_45px] gap-2">
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-coal/50 font-semibold">Nome da Cor</span>
                <input
                  type="text"
                  placeholder="Areia, Moss, Preto..."
                  value={varCor}
                  onChange={(e) => setVarCor(e.target.value)}
                  className="w-full h-8 px-2 rounded border border-ink/10 text-xs text-ink outline-none focus:border-ink"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-coal/50 font-semibold block text-center">Cor</span>
                <input
                  type="color"
                  value={varCorHex}
                  onChange={(e) => setVarCorHex(e.target.value)}
                  className="w-full h-8 p-0 border-0 rounded cursor-pointer"
                  title="Selecione tom visual"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Tamanho */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-coal/50 font-semibold">Tamanho</span>
                <select
                  value={varTamanho}
                  onChange={(e) => setVarTamanho(e.target.value as Tamanho)}
                  className="w-full h-8 px-2 rounded border border-ink/10 bg-white text-xs text-ink outline-none"
                >
                  {TAMANHOS.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantidade */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-coal/50 font-semibold">Estoque Inicial</span>
                <input
                  type="number"
                  min="0"
                  value={varEstoque}
                  onChange={(e) => setVarEstoque(Number(e.target.value))}
                  className="w-full h-8 px-2 rounded border border-ink/10 text-xs text-ink outline-none focus:border-ink"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddVariation}
              className="w-full h-8 bg-gold hover:bg-gold/90 text-ink text-xs font-bold rounded flex items-center justify-center gap-1 transition-all"
            >
              <Plus size={14} />
              <span>Adicionar Variação</span>
            </button>
          </div>

          {/* Variations List */}
          <div className="space-y-2.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-coal/50">Variações Adicionadas</p>
            {variacoes.length > 0 ? (
              <div className="divide-y divide-ink/5 max-h-64 overflow-y-auto border border-ink/8 rounded-lg bg-white">
                {variacoes.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="h-4.5 w-4.5 rounded-full border border-ink/10 shrink-0"
                        style={{ backgroundColor: item.corHex || "#ccc" }}
                      />
                      <span className="font-semibold text-ink truncate">
                        {item.cor} · {item.tamanho}
                      </span>
                      <span className="text-coal/50 font-mono">({item.quantidadeEstoque} un)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveVariation(item.id)}
                      className="p-1 text-coal/40 hover:text-clay hover:bg-clay/5 rounded transition-all shrink-0"
                      title="Excluir variação"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-coal/40 italic p-3 border border-dashed border-ink/12 rounded-lg text-center bg-pearl/5">
                Nenhuma variação criada. Adicione variações no painel acima.
              </p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
