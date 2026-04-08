import { useState, useEffect, useRef } from "react";
import './App.css'
const LS_KEY = "atividade_usuarios";
const getUsers = () => JSON.parse(localStorage.getItem(LS_KEY) || "[]");
const saveUsers = (users) => localStorage.setItem(LS_KEY, JSON.stringify(users));
const formatCPF = (v) =>
  v.replace(/\D/g, "").slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");

const validations = {
nome: (v) => {
  const nome = v.trim();
  if (nome.length < 3) {
    return "Nome deve ter ao menos 3 caracteres.";
  }

  if (!/^[A-Za-zÀ-ÿ\s]+$/.test(nome)) {
    return "Nome deve conter apenas letras.";
  }

  return "";
},
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "" : "E-mail inválido.",
  cpf: (v) => v.replace(/\D/g, "").length === 11 ? "" : "CPF deve ter 11 dígitos.",
idade: (v) => {
  if (!/^\d+$/.test(v)) {
    return "Idade deve conter apenas números inteiros.";
  }

  const idade = Number(v);
  return (idade >= 1 && idade <= 120)? "": "Idade deve ser entre 1 e 120.";
}
};

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return <div className={`toast ${type}`}>{type === "success" ? "✅" : "❌"} {msg}</div>;
}

function TelaCadastro({ showToast }) {
  const empty = { nome: "", email: "", cpf: "", idade: "" };
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validate = (name, value) => validations[name]?.(value) || "";
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: name === "cpf" ? formatCPF(value) : value }));
    if (touched[name]) setErrors((e) => ({ ...e, [name]: validate(name, value) }));
  }
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((t) => ({ ...t, [name]: true }));
    setErrors((e) => ({ ...e, [name]: validate(name, value) }));
  }
  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    Object.keys(form).forEach((key) => {
    newErrors[key] = validate(key, form[key]);
    });
    setErrors(newErrors);
    setTouched({ nome: true, email: true, cpf: true, idade: true });
   if (Object.values(newErrors).some(Boolean)) { showToast("Corrija os erros antes de salvar.", "error"); return; }
    const users = getUsers();
    if (users.find((u) => u.cpf === form.cpf)) { showToast("CPF já cadastrado!", "error"); return; }
    saveUsers([...users, { ...form, id: Date.now() }]);
    setForm(empty);
    setTouched({});
    setErrors({});
    showToast("Usuário cadastrado com sucesso!", "success");
  };
 const fieldStatus = (name) => {
    if (!touched[name]) return "";
    return errors[name] ? "error" : "ok";
  };
  return (
    <>
      <h1 className="page-title">Cadastro de Usuário</h1>
      <p className="page-sub">Preencha os dados abaixo. Validação em tempo real com armazenamento local.</p>
      <div className="card">
        <div className="form-grid">
          {[
            { name: "nome", label: "Nome completo", type: "text", placeholder: "Ex: Maria Silva" },
            { name: "email", label: "E-mail", type: "email", placeholder: "Ex: maria@email.com" },
            { name: "cpf", label: "CPF", type: "text", placeholder: "000.000.000-00" },
            { name: "idade", label: "Idade", type: "number", placeholder: "Ex: 22" },
          ].map(({ name, label, type, placeholder }) => (
            <div className="form-group" key={name}>
              <label htmlFor={name}>{label}</label>
              <input
                id={name} name={name} type={type} placeholder={placeholder}
                value={form[name]} onChange={handleChange} onBlur={handleBlur}
                className={fieldStatus(name)}
              />
              <span className={`field-msg ${fieldStatus(name)}`}>
                {touched[name] && errors[name] ? errors[name] : touched[name] && !errors[name] ? "✓ Ok" : ""}
              </span>
            </div>
          ))}
        </div>
        <div className="btn-row">
          <button className="btn btn-primary" onClick={handleSubmit}> Salvar</button>
          <button className="btn btn-ghost" onClick={() => { setForm(empty); setTouched({}); setErrors({}); }}> Limpar</button>
        </div>
      </div>
    </>
  );
}
function TelaLista({ showToast }) {
  const [users, setUsers] = useState(getUsers());
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({});

  const refresh = () => setUsers(getUsers());

  const handleDelete = (id) => {
    saveUsers(getUsers().filter((u) => u.id !== id));
    refresh();
    showToast("Usuário removido.", "success");
  };

  const handleDeleteAll = () => {
    localStorage.removeItem(LS_KEY);
    refresh();
    showToast("Todos os dados foram apagados.", "success");
  };

  const startEdit = (u) => { setEditing(u.id); setEditForm({ ...u }); };
  const cancelEdit = () => { setEditing(null); setEditForm({}); };
const validateUser = (users, user, editingId) => {
  if (user.cpf.replace(/\D/g, "").length !== 11) {
    return "CPF deve ter 11 dígitos.";
  }
  if (users.find((u) => u.cpf === user.cpf && u.id !== editingId)) {
    return "CPF já cadastrado para outro usuário!";
  }
  if (user.idade < 1 || user.idade > 120) {
    return "Idade deve ser entre 1 e 120.";
  }
  if (!/^[A-Za-zÀ-ÿ\s]+$/.test(user.nome) || user.nome.length < 3) {
    return "Nome deve conter apenas letras e ter pelo menos 3 caracteres.";
  }
  user.cpf = formatCPF(user.cpf);
  return null;
}
const saveEdit = () => {
  const error = validateUser(getUsers(), editForm, editing);
  if (error){
    showToast(error, "error");
    return;
  }

  const updated = getUsers().map((u) =>
    u.id === editing ? editForm : u
  );

  saveUsers(updated);
  refresh();
  setEditing(null);
  showToast("Usuário atualizado.", "success");
};

  return (
    <>
      <h1 className="page-title">Lista de Usuários</h1>
      <p className="page-sub">Gerencie os usuários cadastrados no LocalStorage.</p>
      <div className="card">
        <div className="table-wrap">
          {users.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <div>Nenhum usuário cadastrado ainda.</div>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Nome</th><th>E-mail</th><th>CPF</th><th>Idade</th><th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) =>
                  editing === u.id ? (
                    <tr key={u.id}>
                      {["nome", "email", "cpf", "idade"].map((f) => (
                        <td key={f}>
                          <input
                            value={editForm[f]}
                            onChange={(e) => setEditForm((ef) => ({ ...ef, [f]: e.target.value }))}
                            style={{ width: "100%", minWidth: 80 }}
                          />
                        </td>
                      ))}
                      <td>
                        <button className="btn btn-primary btn-sm" onClick={saveEdit}>✓</button>{" "}
                        <button className="btn btn-ghost btn-sm" onClick={cancelEdit}>✕</button>
                      </td>
                    </tr>
                  ) : (
                    <tr key={u.id}>
                      <td><span className="badge badge-purple">{u.nome}</span></td>
                      <td>{u.email}</td>
                      <td>{u.cpf}</td>
                      <td>{u.idade}</td>
                      <td>
                        <button className="btn btn-ghost btn-sm" onClick={() => startEdit(u)}>✏️ Editar</button>{" "}
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id)}>🗑️</button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          )}
        </div>
        {users.length > 0 && (
          <div className="btn-row">
            <button className="btn btn-danger" onClick={handleDeleteAll}>🗑️ Apagar todos os dados</button>
          </div>
        )}
      </div>
    </>
  );
}

function TelaCEP() {
  const [cep, setCep] = useState("");
  const [status, setStatus] = useState(null); 
  const [addr, setAddr] = useState({});

  const fetchCep = async (raw) => {
    const digits = raw.replace(/\D/g, "");
    if (digits.length !== 8) return;
    setStatus("loading");
    setAddr({});
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (data.erro) { setStatus("notfound"); return; }
      setAddr({ rua: data.logradouro, bairro: data.bairro, cidade: data.localidade, estado: data.uf });
      setStatus("found");
    } catch {
      setStatus("notfound");
    }
  };

  const handleCepChange = (e) => {
    const v = e.target.value.replace(/\D/g, "").slice(0, 8)
      .replace(/(\d{5})(\d)/, "$1-$2");
    setCep(v);
  };

  const handleBlur = () => fetchCep(cep);

  return (
    <>
      <h1 className="page-title">Consulta de CEP</h1>
      <p className="page-sub">Digite o CEP e saia do campo — o endereço será preenchido via API.</p>
      <div className="card">
        <div className="cep-input-row">
          <div className="form-group" style={{ flex: 1 }}>
            <label>CEP</label>
            <input
              value={cep} onChange={handleCepChange} onBlur={handleBlur}
              placeholder="12345-678" maxLength={9}
            />
          </div>
          <button className="btn btn-primary" onClick={() => fetchCep(cep)}>🔍 Buscar</button>
        </div>

        {status === "loading" && <div className="status-tag loading">⏳ Buscando CEP...</div>}
        {status === "notfound" && <div className="status-tag notfound">❌ CEP não encontrado ou inválido.</div>}
        {status === "found" && <div className="status-tag found">✅ Endereço encontrado!</div>}

        {status === "found" && (
          <div className="cep-grid">
            {[
              { label: "Rua / Logradouro", value: addr.rua, cls: "full" },
              { label: "Bairro", value: addr.bairro },
              { label: "Cidade", value: addr.cidade },
              { label: "Estado (UF)", value: addr.estado },
            ].map(({ label, value, cls }) => (
              <div className={`cep-field ${cls || ""}`} key={label}>
                <label>{label}</label>
                <input value={value} readOnly style={{ opacity: 0.7 }} />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function TelaSobre() {
  const concepts = [
    { title: "HTML Semântico", desc: "Uso de tags como <main>, <section>, <nav> e <article> para estruturar o conteúdo de forma acessível e significativa para navegadores e leitores de tela." },
    { title: "Box Model", desc: "Toda elemento HTML é uma caixa com content, padding, border e margin. Essencial para controlar espaçamentos e tamanhos com CSS." },
    { title: "Flexbox", desc: "Layout unidimensional (linhas ou colunas) utilizado para alinhar e distribuir elementos dentro de um container de forma responsiva e flexível." },
    { title: "CSS Grid", desc: "Layout bidimensional (linhas e colunas simultâneas) para tabelas, dashboards e qualquer estrutura de grade complexa." },
    { title: "Media Queries", desc: "Permitem aplicar estilos condicionais conforme o tamanho da tela, tornando o layout responsivo para mobile, tablet e desktop." },
    { title: "JavaScript", desc: "Linguagem que adiciona interatividade: validações em tempo real, manipulação do DOM, eventos e lógica de negócio no lado do cliente." },
    { title: "Fetch API", desc: "API nativa do navegador para fazer requisições HTTP assíncronas. Usada neste projeto para consultar endereços na API ViaCEP via GET." },
    { title: "LocalStorage", desc: "Armazenamento key-value no próprio navegador que persiste dados mesmo após fechar a aba. Usado aqui para salvar e recuperar usuários cadastrados." },
  ];

  return (
    <>
      <h1 className="page-title">Sobre o Projeto</h1>
      <p className="page-sub">Aplicação web construída com React como atividade avaliativa de Front-End.</p>

      <div className="card">
        <div style={{ fontWeight: 700, fontSize: "1rem", marginBottom: 16 }}> Objetivo</div>
        <p style={{ color: "var(--muted)", lineHeight: 1.8, fontSize: "0.92rem" }}>
          Desenvolver uma aplicação web com quatro telas interativas navegáveis por um painel lateral.
          A aplicação usa HTML semântico (estrutura), CSS (estilização e layout) e JavaScript (lógica, validação e requisições),
          demonstrando integração entre as tecnologias fundamentais do desenvolvimento Front-End. 
        </p>
      </div>

      <div className="card">
        <div style={{ fontWeight: 700, fontSize: "1rem", marginBottom: 16 }}> Conceitos Utilizados</div>
        <div className="concepts-grid">
          {concepts.map((c) => (
            <div className="concept-card" key={c.title}>
              <div className="concept-icon">{c.icon}</div>
              <div className="concept-title">{c.title}</div>
              <div className="concept-desc">{c.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div style={{ fontWeight: 700, fontSize: "1rem", marginBottom: 16 }}> Tecnologias</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {["React 18", "CSS Vars", "Flexbox", "CSS Grid", "LocalStorage", "Fetch API", "ViaCEP", "Google Fonts"].map((t) => (
            <span className="team-chip" key={t}>{t}</span>
          ))}
        </div>
      </div>

    </>
  );
}

export default function App() {
  const [page, setPage] = useState("cadastro");
  const [toast, setToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const showToast = (msg, type) => setToast({ msg, type });

  const handleNavClick = (id) => {
    setPage(id);
    if (sidebarOpen) setSidebarOpen(false);
  };

  const nav = [
    { id: "cadastro", icon: "👤", label: "Cadastro" },
    { id: "lista", icon: "📋", label: "Usuários" },
    { id: "cep", icon: "📍", label: "Consulta CEP" },
    { id: "sobre", icon: "ℹ️", label: "Sobre" },
  ];

  const pages = {
    cadastro: <TelaCadastro showToast={showToast} />,
    lista: <TelaLista showToast={showToast} />,
    cep: <TelaCEP />,
    sobre: <TelaSobre />,
  };
 return (
    <>
      <div className="app">
        <button className="mobile-nav-toggle" onClick={() => setSidebarOpen(true)} aria-label="Abrir menu">
          ☰
        </button>
        <div className={`sidebar-backdrop ${sidebarOpen ? "visible" : ""}`} onClick={() => setSidebarOpen(false)} />
        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="sidebar-header">
            <div className="sidebar-brand">Consultas React</div>
            <button className="sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Fechar menu">✕</button>
          </div>
          <ul className="nav-list">
            {nav.map(({ id, icon, label }) => (
              <li key={id} className={`nav-item ${page === id ? "active" : ""}`} onClick={() => handleNavClick(id)}>
                <span className="icon">{icon}</span>
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </aside>
        <main className="main">{pages[page]}</main>
        {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      </div>
    </>
  );
}


