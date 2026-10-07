document.getElementById('btnValidar').addEventListener('click', validarHTML);
document.getElementById('btnLimpar').addEventListener('click', limparTudo);
document.getElementById('htmlInput').addEventListener('input', atualizarNumLinhas);

function atualizarNumLinhas() {
    const input = document.getElementById('htmlInput').value;
    const lines = input.split('\n').length;
    const lineNumbers = document.getElementById('lineNumbers');
    lineNumbers.innerHTML = Array.from({ length: lines }, (_, i) => i + 1).join('<br>');
}

function carregarExemplo(tipo) {
    const textarea = document.getElementById('htmlInput');
    if (tipo === 'valido') {
        textarea.value = `<!DOCTYPE html>\n<html>\n  <head>\n    <title>Teste Válido</title>\n  </head>\n  <body>\n    <div class="main">\n      <p>Texto de exemplo</p>\n    </div>\n  </body>\n</html>`;
    } else if (tipo === 'erro_linha') {
        textarea.value = `<div>\n  <section>\n    <p>Tag sem fechar aqui...\n  </section>\n</div>`;
    } else if (tipo === 'orfa') {
        textarea.value = `<form>\n  <label>Nome:</label>\n  <input type="text" name="nome">\n  <br>\n  <img src="foto.jpg" alt="Foto">\n</form>`;
    }
    atualizarNumLinhas();
    validarHTML();
}

function limparTudo() {
    document.getElementById('htmlInput').value = '';
    document.getElementById('consoleText').textContent = 'Aguardando execução...';
    document.getElementById('consoleText').className = 'console-body';
    atualizarNumLinhas();
}

function validarHTML() {
    const input = document.getElementById('htmlInput').value;
    const consoleText = document.getElementById('consoleText');
    
    if (!input.trim()) {
        consoleText.textContent = 'Erro: Insira algum código HTML para validar.';
        consoleText.className = 'console-body error';
        return;
    }

    const stack = [];
    const lines = input.split('\n');
    const selfClosing = ['br', 'hr', 'img', 'input', 'meta', 'link'];
    let isValid = true;
    let errorMsg = '';

    for (let i = 0; i < lines.length; i++) {
        const lineNum = i + 1;
        const line = lines[i];
        const tagRegex = /<\/?([a-z1-6]+)[^>]*>/gi;
        let match;

        while ((match = tagRegex.exec(line)) !== null) {
            const fullTag = match[0];
            const tagName = match[1].toLowerCase();

            if (fullTag.startsWith('<!')) continue;

            if (selfClosing.includes(tagName) || fullTag.endsWith('/>')) {
                continue;
            }

            if (!fullTag.startsWith('</')) {
                stack.push({ tag: tagName, line: lineNum });
            } else {
                if (stack.length === 0) {
                    isValid = false;
                    errorMsg = `Mal formatado: Tag de fechamento </${tagName}> inesperada na linha ${lineNum}`;
                    break;
                }
                const last = stack.pop();
                if (last.tag !== tagName) {
                    isValid = false;
                    errorMsg = `Mal formatado: Tag de fechamento </${tagName}> inesperada na linha ${lineNum}`;
                    break;
                }
            }
        }
        if (!isValid) break;
    }

    if (isValid && stack.length > 0) {
        const unclosed = stack.pop();
        isValid = false;
        errorMsg = `Mal formatado: Tag <${unclosed.tag}> aberta na linha ${unclosed.line} nao foi fechada`;
    }

    if (isValid) {
        consoleText.textContent = 'SAÍDA: Bem formatado';
        consoleText.className = 'console-body success';
    } else {
        consoleText.textContent = `SAÍDA: ${errorMsg}`;
        consoleText.className = 'console-body error';
    }
}