document.addEventListener('DOMContentLoaded', () => {

  // =============================================
  //  全局变量
  // =============================================
  const pages = document.querySelectorAll('.page');
  let currentPage = 'page-splash';
  let isAnimating = false;
  const navHistory = [];
  let countdownTimer = null;
  let countdownValue = 0;

  // =============================================
  //  Lucide 图标初始化
  // =============================================
  lucide.createIcons({ icons: lucide.icons });

  // =============================================
  //  页面导航系统
  // =============================================
  function navigateTo(targetId, options = {}) {
    const { direction = 'forward', pushHistory = true } = options;
    if (isAnimating || targetId === currentPage) return;

    const from = document.getElementById(currentPage);
    const to = document.getElementById(targetId);
    if (!from || !to) return;

    isAnimating = true;
    if (pushHistory) navHistory.push(currentPage);

    to.style.display = '';
    to.classList.add('active');

    if (direction === 'forward') {
      to.classList.add('slide-in-right');
      from.classList.add('slide-out-left');
    } else if (direction === 'back') {
      to.classList.add('slide-in-left');
      from.classList.add('slide-out-right');
    } else {
      to.classList.add('fade-in');
      from.classList.add('fade-out');
    }

    setTimeout(() => {
      pages.forEach(p => {
        p.classList.remove(
          'slide-in-right', 'slide-out-left',
          'slide-in-left', 'slide-out-right',
          'fade-in', 'fade-out'
        );
        if (p.id !== targetId) p.classList.remove('active');
      });
      to.classList.add('active');
      currentPage = targetId;
      isAnimating = false;
      syncTabState(targetId);
      updateSidebar(targetId);
      scrollChatToBottom(to);
    }, 300);
  }

  // =============================================
  //  Tab 状态同步
  // =============================================
  function syncTabState(pageId) {
    document.querySelectorAll('.tab-bar').forEach(bar => {
      bar.querySelectorAll('[data-tab]').forEach(tab => {
        tab.classList.toggle('active', tab.getAttribute('data-tab') === pageId);
      });
    });
  }

  // =============================================
  //  滚动聊天区到底部
  // =============================================
  function scrollChatToBottom(container) {
    const area = (container || document).querySelector('.messages-area');
    if (area) area.scrollTop = area.scrollHeight;
  }

  // =============================================
  //  1. 启动页自动跳转 (1800ms)
  // =============================================
  setTimeout(() => {
    navigateTo('page-login', { direction: 'fade', pushHistory: false });
  }, 1800);

  // =============================================
  //  2. 登录页 — 获取验证码倒计时
  // =============================================
  const codeBtn = document.getElementById('btn-code');
  if (codeBtn) {
    codeBtn.addEventListener('click', () => {
      if (countdownValue > 0) return;
      countdownValue = 60;
      codeBtn.disabled = true;
      codeBtn.textContent = '60s';
      codeBtn.classList.add('disabled');

      countdownTimer = setInterval(() => {
        countdownValue--;
        if (countdownValue <= 0) {
          clearInterval(countdownTimer);
          countdownTimer = null;
          codeBtn.disabled = false;
          codeBtn.textContent = '获取验证码';
          codeBtn.classList.remove('disabled');
        } else {
          codeBtn.textContent = `${countdownValue}s`;
        }
      }, 1000);
    });
  }

  // =============================================
  //  3. 登录页 Tab 切换 & 按钮
  // =============================================
  document.querySelectorAll('.login-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.login-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const type = tab.getAttribute('data-login-tab');
      document.querySelectorAll('.login-tab-content').forEach(c => c.classList.remove('active'));
      const target = document.getElementById('login-tab-' + type);
      if (target) target.classList.add('active');
    });
  });

  const loginBtn = document.getElementById('btn-login');
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      navigateTo('page-messages', { direction: 'forward' });
    });
  }

  const goRegBtn = document.getElementById('btn-go-register');
  if (goRegBtn) {
    goRegBtn.addEventListener('click', () => {
      navigateTo('page-register', { direction: 'forward' });
    });
  }

  // =============================================
  //  4. Tab 栏切换
  // =============================================
  document.querySelectorAll('[data-tab]').forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('data-tab');
      if (!targetId || targetId === currentPage) return;
      navigateTo(targetId, { direction: 'fade', pushHistory: false });
    });
  });

  // =============================================
  //  5. 聊天卡片点击（长按时不跳转）
  // =============================================
  window._chatLongPressed = false;
  document.querySelectorAll('.chat-card[data-chat]').forEach(card => {
    card.addEventListener('click', (e) => {
      if (window._chatLongPressed) { window._chatLongPressed = false; return; }
      const chatId = card.getAttribute('data-chat');
      if (chatId) navigateTo(chatId, { direction: 'forward' });
    });
  });

  // =============================================
  //  6. 返回按钮
  // =============================================
  document.querySelectorAll('[data-back]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const backTarget = btn.getAttribute('data-back');
      navHistory.pop();
      navigateTo(backTarget, { direction: 'back', pushHistory: false });
    });
  });

  // =============================================
  //  7. 群聊通知栏关闭
  // =============================================
  const closeNotice = document.getElementById('close-notice');
  const noticeBar = document.getElementById('notice-bar');
  if (closeNotice && noticeBar) {
    closeNotice.addEventListener('click', () => {
      noticeBar.style.overflow = 'hidden';
      noticeBar.style.transition = 'height 300ms ease, opacity 300ms ease';
      noticeBar.style.height = noticeBar.offsetHeight + 'px';
      requestAnimationFrame(() => {
        noticeBar.style.height = '0';
        noticeBar.style.opacity = '0';
      });
      setTimeout(() => {
        noticeBar.style.display = 'none';
      }, 300);
    });
  }

  // =============================================
  //  8. 主题切换
  // =============================================
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      themeToggle.classList.add('active');
    }

    themeToggle.addEventListener('click', () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      if (isDark) {
        document.documentElement.removeAttribute('data-theme');
        themeToggle.classList.remove('active');
        localStorage.setItem('theme', 'light');
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggle.classList.add('active');
        localStorage.setItem('theme', 'dark');
      }
      syncSidebarThemeButtons();
    });
  }

  // =============================================
  //  9. 退出登录
  // =============================================
  const logoutBtn = document.getElementById('btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('确定要退出登录吗？')) {
        navHistory.length = 0;
        navigateTo('page-login', { direction: 'fade', pushHistory: false });
      }
    });
  }

  // =============================================
  //  10. 消息发送模拟
  // =============================================
  const groupMembers = ['李娜', '王明', '张伟', '赵雪'];

  function highlightMentions(html) {
    groupMembers.forEach(function(name) {
      var regex = new RegExp('@' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      html = html.replace(regex, '<span class="at-highlight">@' + name + '</span>');
    });
    return html;
  }

  function sendMessage(inputEl) {
    const text = inputEl.value.trim();
    if (!text) return;

    const messagesArea = inputEl.closest('.page').querySelector('.messages-area');
    if (!messagesArea) return;

    const isGroup = inputEl.closest('#page-group-chat');
    const bubbleContent = isGroup ? highlightMentions(escapeHtml(text)) : escapeHtml(text);

    const row = document.createElement('div');
    row.className = 'message-row self';
    row.innerHTML =
      '<div class="bubble self-bubble">' + bubbleContent + '</div>' +
      '<div class="msg-avatar" style="background:linear-gradient(135deg,#0984E3,#74B9FF)">我</div>';
    messagesArea.appendChild(row);

    inputEl.value = '';
    var mentionPanel = document.getElementById('at-mention-panel');
    if (mentionPanel) mentionPanel.classList.remove('show');
    lucide.createIcons({ icons: lucide.icons });
    messagesArea.scrollTop = messagesArea.scrollHeight;

    setTimeout(() => {
      const reply = document.createElement('div');
      reply.className = 'message-row other';

      if (isGroup) {
        reply.innerHTML =
          '<div class="msg-avatar" style="background:linear-gradient(135deg,#007AFF,#5AC8FA)">张</div>' +
          '<div class="msg-content-group">' +
            '<span class="sender-name">张伟</span>' +
            '<div class="bubble">收到</div>' +
          '</div>';
      } else {
        reply.innerHTML =
          '<div class="msg-avatar" style="background:linear-gradient(135deg,#007AFF,#5AC8FA)">张</div>' +
          '<div class="bubble">收到</div>';
      }

      messagesArea.appendChild(reply);
      lucide.createIcons({ icons: lucide.icons });
      messagesArea.scrollTop = messagesArea.scrollHeight;
    }, 1000);
  }

  function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  document.querySelectorAll('.chat-input').forEach(input => {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        var mentionPanel = document.getElementById('at-mention-panel');
        if (mentionPanel && mentionPanel.classList.contains('show')) return;
        e.preventDefault();
        sendMessage(input);
      }
    });
  });

  // +号按钮不再触发发送，改为打开功能面板（在下方事件委托中处理）

  // =============================================
  //  11. 聊天列表左滑操作
  // =============================================
  let touchStartX = 0;
  let touchCurrentX = 0;
  let swipingCard = null;
  const SWIPE_THRESHOLD = 60;

  document.querySelectorAll('.chat-card[data-chat]').forEach(card => {
    card.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      swipingCard = card;
      card.style.transition = 'none';
    }, { passive: true });

    card.addEventListener('touchmove', (e) => {
      if (swipingCard !== card) return;
      touchCurrentX = e.touches[0].clientX;
      const diff = touchCurrentX - touchStartX;
      if (diff < 0) {
        card.style.transform = `translateX(${Math.max(diff, -120)}px)`;
      }
    }, { passive: true });

    card.addEventListener('touchend', () => {
      if (swipingCard !== card) return;
      const diff = touchCurrentX - touchStartX;
      card.style.transition = 'transform 200ms ease';
      if (diff < -SWIPE_THRESHOLD) {
        card.style.transform = 'translateX(-120px)';
      } else {
        card.style.transform = '';
      }
      swipingCard = null;
      touchCurrentX = 0;
    });
  });

  // =============================================
  //  12. 头像首字母渲染
  // =============================================
  document.querySelectorAll('[data-initial]').forEach(el => {
    el.textContent = el.getAttribute('data-initial');
  });

  // =============================================
  //  13. 页面加载时滚动消息区到底部
  // =============================================
  document.querySelectorAll('.messages-area').forEach(area => {
    area.scrollTop = area.scrollHeight;
  });

  // =============================================
  //  14. Control Panel — 侧边栏交互
  // =============================================

  function updateSidebar(pageId) {
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.dataset.goto === pageId);
    });
  }

  function syncSidebarThemeButtons() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    document.querySelectorAll('.theme-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.themeMode === (isDark ? 'dark' : 'light'));
    });
  }

  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.themeMode;
      document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (mode === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
      localStorage.setItem('theme', mode);
      const toggle = document.getElementById('theme-toggle');
      if (toggle) {
        toggle.classList.toggle('active', mode === 'dark');
      }
    });
  });

  document.querySelectorAll('.nav-link[data-goto]').forEach(link => {
    link.addEventListener('click', () => {
      const targetId = link.dataset.goto;
      navigateTo(targetId, { direction: 'fade', pushHistory: false });
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      syncTabState(targetId);
    });
  });

  // 初始化：同步侧边栏主题按钮状态
  syncSidebarThemeButtons();

  // =============================================
  //  15. 「全部」链接跳转到交易明细页
  // =============================================
  document.querySelectorAll('[data-goto-tx]').forEach(link => {
    link.addEventListener('click', () => {
      navigateTo(link.dataset.gotoTx, { direction: 'forward' });
    });
  });

  // =============================================
  //  15b. 钱包 充值/提现
  // =============================================
  (function() {
    var rechargeBtn = document.getElementById('wallet-recharge-btn');
    var withdrawBtn = document.getElementById('wallet-withdraw-btn');
    if (rechargeBtn) rechargeBtn.addEventListener('click', function() { navigateTo('page-recharge', { direction: 'forward' }); });
    if (withdrawBtn) withdrawBtn.addEventListener('click', function() { navigateTo('page-withdraw', { direction: 'forward' }); });

    document.getElementById('app').addEventListener('click', function(e) {
      var q = e.target.closest('.quick-amount');
      if (q && q.closest('#page-recharge')) {
        var amount = q.getAttribute('data-amount');
        var input = document.getElementById('recharge-amount');
        if (input) input.value = amount;
        return;
      }
      var payItem = e.target.closest('.pay-method-item');
      if (payItem && payItem.closest('#page-recharge')) {
        payItem.closest('.wallet-pay-method').querySelectorAll('.pay-method-item').forEach(function(el) { el.classList.remove('selected'); });
        payItem.classList.add('selected');
        return;
      }
    });

    var rechargeSubmit = document.getElementById('recharge-submit');
    if (rechargeSubmit) {
      rechargeSubmit.addEventListener('click', function() {
        var input = document.getElementById('recharge-amount');
        var amount = input && parseFloat(input.value);
        if (!amount || amount <= 0) { alert('请输入充值金额'); return; }
        alert('充值 ¥' + amount.toFixed(2) + ' 成功！');
        navigateTo('page-wallet', { direction: 'back' });
      });
    }

    var withdrawSubmit = document.getElementById('withdraw-submit');
    if (withdrawSubmit) {
      withdrawSubmit.addEventListener('click', function() {
        var input = document.getElementById('withdraw-amount');
        var amount = input && parseFloat(input.value);
        if (!amount || amount <= 0) { alert('请输入提现金额'); return; }
        if (amount > 1280.5) { alert('超出可提现余额'); return; }
        var method = document.querySelector('.withdraw-method-tab.active');
        var methodType = method ? method.getAttribute('data-withdraw-method') : '';
        if (methodType === 'alipay' && !window._alipayBound) { alert('请先绑定支付宝账号'); return; }
        if (methodType === 'bank' && !window._bankBound) { alert('请先绑定银行卡'); return; }
        if (methodType === 'virtual' && (!window._virtualAddresses || window._virtualAddresses.length === 0)) { alert('请先绑定虚拟币地址'); return; }
        alert('提现 ¥' + amount.toFixed(2) + ' 已提交，预计2小时内到账');
        navigateTo('page-wallet', { direction: 'back' });
      });
    }

    document.getElementById('app').addEventListener('click', function(e) {
      var tab = e.target.closest('.withdraw-method-tab');
      if (tab && tab.closest('#page-withdraw')) {
        tab.closest('.wallet-form-row').querySelectorAll('.withdraw-method-tab').forEach(function(t) { t.classList.remove('active'); });
        tab.classList.add('active');
        var method = tab.getAttribute('data-withdraw-method');
        var alipayArea = document.getElementById('withdraw-alipay-area');
        var bankArea = document.getElementById('withdraw-bank-area');
        var virtualArea = document.getElementById('withdraw-virtual-area');
        if (alipayArea) alipayArea.style.display = method === 'alipay' ? '' : 'none';
        if (bankArea) bankArea.style.display = method === 'bank' ? '' : 'none';
        if (virtualArea) virtualArea.style.display = method === 'virtual' ? '' : 'none';
        return;
      }
      if (e.target.closest('#bind-alipay-btn')) {
        navigateTo('page-bind-alipay', { direction: 'forward' });
        return;
      }
      if (e.target.closest('#bind-virtual-btn')) {
        navigateTo('page-bind-virtual', { direction: 'forward' });
        return;
      }
      if (e.target.closest('#bind-bank-btn')) {
        navigateTo('page-bind-bank', { direction: 'forward' });
        return;
      }
    });

    var bankBindSubmit = document.getElementById('bank-bind-submit');
    if (bankBindSubmit) {
      bankBindSubmit.addEventListener('click', function() {
        var name = document.getElementById('bank-holder-name').value.trim();
        var cardNo = document.getElementById('bank-card-no').value.trim();
        var bankName = document.getElementById('bank-select').value;
        var phone = document.getElementById('bank-phone').value.trim();
        if (!name) { alert('请输入持卡人姓名'); return; }
        if (!cardNo || cardNo.length < 16) { alert('请输入正确的银行卡号'); return; }
        if (!bankName) { alert('请选择开户银行'); return; }
        if (!phone || phone.length !== 11) { alert('请输入正确的手机号'); return; }
        window._bankBound = { name: name, cardNo: cardNo, bankName: bankName, phone: phone };
        var display = '**** **** **** ' + cardNo.slice(-4);
        var preview = document.getElementById('bank-bound-preview');
        var bindLink = document.getElementById('bind-bank-btn');
        var nameDisplay = document.getElementById('bank-name-display');
        var noDisplay = document.getElementById('bank-no-display');
        if (preview) preview.style.display = '';
        if (bindLink) bindLink.style.display = 'none';
        if (nameDisplay) nameDisplay.textContent = bankName;
        if (noDisplay) noDisplay.textContent = display;
        alert('银行卡绑定成功');
        navigateTo('page-withdraw', { direction: 'back' });
      });
    }

    var alipayBindSubmit = document.getElementById('alipay-bind-submit');
    if (alipayBindSubmit) {
      alipayBindSubmit.addEventListener('click', function() {
        var account = document.getElementById('alipay-account').value.trim();
        var realname = document.getElementById('alipay-realname').value.trim();
        if (!account) { alert('请输入支付宝账号'); return; }
        if (account.length !== 11) { alert('请输入正确的11位手机号'); return; }
        if (!realname) { alert('请输入真实姓名'); return; }
        window._alipayBound = { account: account, name: realname };
        var display = account.slice(0, 3) + '****' + account.slice(-4);
        var preview = document.getElementById('alipay-bound-preview');
        var bindLink = document.getElementById('bind-alipay-btn');
        var accountDisplay = document.getElementById('alipay-account-display');
        var nameDisplay = document.getElementById('alipay-name-display');
        if (preview) preview.style.display = '';
        if (bindLink) bindLink.style.display = 'none';
        if (accountDisplay) accountDisplay.textContent = display;
        if (nameDisplay) nameDisplay.textContent = realname;
        alert('支付宝账号绑定成功');
        navigateTo('page-withdraw', { direction: 'back' });
      });
    }

    if (!window._virtualAddresses) window._virtualAddresses = [];

    function renderVirtualList() {
      var list = document.getElementById('virtual-address-list');
      var empty = document.getElementById('virtual-list-empty');
      if (!list || !empty) return;
      list.innerHTML = '';
      var arr = window._virtualAddresses;
      if (arr.length === 0) {
        empty.classList.remove('hidden');
        return;
      }
      empty.classList.add('hidden');
      arr.forEach(function(item, index) {
        var el = document.createElement('div');
        el.className = 'virtual-address-item';
        el.dataset.index = index;
        var shortAddr = item.address.length > 16 ? item.address.slice(0, 8) + '...' + item.address.slice(-8) : item.address;
        el.innerHTML = '<div class="virtual-address-item-info">' +
          '<div class="virtual-address-item-type">' + (item.remark || item.type) + '</div>' +
          '<div class="virtual-address-item-addr">' + shortAddr + '</div></div>' +
          '<button type="button" class="virtual-address-item-remove">移除</button>';
        list.appendChild(el);
      });
    }

    document.getElementById('app').addEventListener('click', function(e) {
      var removeBtn = e.target.closest('.virtual-address-item-remove');
      if (removeBtn) {
        var item = removeBtn.closest('.virtual-address-item');
        var index = parseInt(item.dataset.index, 10);
        window._virtualAddresses.splice(index, 1);
        renderVirtualList();
        return;
      }
    });

    var virtualBindSubmit = document.getElementById('virtual-bind-submit');
    if (virtualBindSubmit) {
      virtualBindSubmit.addEventListener('click', function() {
        var type = document.getElementById('virtual-coin-type').value;
        var address = document.getElementById('virtual-address').value.trim();
        var remark = document.getElementById('virtual-remark').value.trim();
        if (!address) { alert('请输入钱包地址'); return; }
        if (address.length < 20) { alert('请填写完整的钱包地址'); return; }
        window._virtualAddresses.push({ type: type, address: address, remark: remark });
        document.getElementById('virtual-address').value = '';
        document.getElementById('virtual-remark').value = '';
        renderVirtualList();
        alert('绑定成功');
      });
    }

    renderVirtualList();
  })();

  // =============================================
  //  16. 交易明细筛选按钮交互
  // =============================================
  document.querySelectorAll('.tx-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tx-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      document.querySelectorAll('.tx-detail-item').forEach(item => {
        if (filter === 'all' || item.dataset.type === filter) {
          item.style.display = 'flex';
        } else {
          item.style.display = 'none';
        }
      });
      document.querySelectorAll('.tx-month-header').forEach(header => {
        let next = header.nextElementSibling;
        let hasVisible = false;
        while (next && !next.classList.contains('tx-month-header')) {
          if (next.style.display !== 'none') hasVisible = true;
          next = next.nextElementSibling;
        }
        header.style.display = hasVisible ? 'block' : 'none';
      });
    });
  });

  // =============================================
  //  17. 长按上下文菜单（微信风格）
  // =============================================
  (function() {
    let pressTimer = null;
    let mouseTimer = null;
    let activeCard = null;
    let longPressed = false;
    const menu = document.getElementById('context-menu');
    const overlay = document.getElementById('context-overlay');
    const pinBtn = document.getElementById('ctx-pin');
    const readBtn = document.getElementById('ctx-read');
    const muteBtn = document.getElementById('ctx-mute');
    const hideBtn = document.getElementById('ctx-hide');
    const deleteBtn = document.getElementById('ctx-delete');

    function showMenu(card, x, y) {
      activeCard = card;
      const menuW = 160, menuH = 260;
      const maxX = window.innerWidth - menuW - 10;
      const maxY = window.innerHeight - menuH - 10;
      menu.style.left = Math.min(x, maxX) + 'px';
      menu.style.top = Math.min(Math.max(y, 10), maxY) + 'px';

      const isPinned = card.classList.contains('pinned');
      pinBtn.querySelector('span').textContent = isPinned ? '取消置顶' : '置顶';

      const badge = card.querySelector('.badge');
      const hasUnread = badge && badge.style.display !== 'none';
      readBtn.querySelector('span').textContent = hasUnread ? '标为已读' : '标为未读';

      const isMuted = card.classList.contains('muted');
      muteBtn.querySelector('span').textContent = isMuted ? '取消免打扰' : '消息免打扰';

      menu.classList.add('show');
      overlay.classList.add('show');
    }

    function hideMenu() {
      menu.classList.remove('show');
      overlay.classList.remove('show');
      activeCard = null;
    }

    document.querySelectorAll('#page-messages .chat-card').forEach(card => {
      // 触屏长按
      card.addEventListener('touchstart', function(e) {
        const touch = e.touches[0];
        pressTimer = setTimeout(() => {
          window._chatLongPressed = true;
          showMenu(card, touch.clientX, touch.clientY);
        }, 500);
      }, { passive: true });
      card.addEventListener('touchend', () => clearTimeout(pressTimer));
      card.addEventListener('touchmove', () => clearTimeout(pressTimer));

      // 鼠标长按（电脑端）
      card.addEventListener('mousedown', function(e) {
        if (e.button !== 0) return;
        longPressed = false;
        const sx = e.clientX, sy = e.clientY;
        mouseTimer = setTimeout(() => {
          longPressed = true;
          window._chatLongPressed = true;
          showMenu(card, sx, sy);
        }, 500);
      });
      card.addEventListener('mouseup', () => clearTimeout(mouseTimer));
      card.addEventListener('mouseleave', () => clearTimeout(mouseTimer));

      // 右键菜单
      card.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        showMenu(card, e.clientX, e.clientY);
      });
    });

    overlay.addEventListener('click', hideMenu);

    pinBtn.addEventListener('click', function() {
      if (!activeCard) return;
      const list = activeCard.parentElement;
      if (activeCard.classList.contains('pinned')) {
        activeCard.classList.remove('pinned');
        const pinTag = activeCard.querySelector('.pin-tag');
        if (pinTag) pinTag.remove();
      } else {
        activeCard.classList.add('pinned');
        list.insertBefore(activeCard, list.firstChild);
        if (!activeCard.querySelector('.pin-tag')) {
          const tag = document.createElement('span');
          tag.className = 'pin-tag';
          tag.textContent = '📌';
          const chatTop = activeCard.querySelector('.chat-top');
          if (chatTop) chatTop.appendChild(tag);
        }
      }
      hideMenu();
    });

    readBtn.addEventListener('click', function() {
      if (!activeCard) return;
      const badge = activeCard.querySelector('.badge');
      if (badge) {
        if (badge.style.display === 'none') {
          badge.style.display = '';
        } else {
          badge.style.display = 'none';
        }
      }
      hideMenu();
    });

    muteBtn.addEventListener('click', function() {
      if (!activeCard) return;
      activeCard.classList.toggle('muted');
      const muteIcon = activeCard.querySelector('.mute-icon');
      if (activeCard.classList.contains('muted')) {
        if (!muteIcon) {
          const icon = document.createElement('span');
          icon.className = 'mute-icon';
          icon.textContent = '🔇';
          const chatTop = activeCard.querySelector('.chat-top');
          if (chatTop) chatTop.appendChild(icon);
        }
      } else {
        if (muteIcon) muteIcon.remove();
      }
      hideMenu();
    });

    hideBtn.addEventListener('click', function() {
      if (!activeCard) return;
      activeCard.style.transition = 'opacity 0.3s, max-height 0.3s';
      activeCard.style.opacity = '0';
      activeCard.style.maxHeight = '0';
      activeCard.style.overflow = 'hidden';
      setTimeout(() => activeCard.remove(), 300);
      hideMenu();
    });

    deleteBtn.addEventListener('click', function() {
      if (!activeCard) return;
      activeCard.style.transition = 'opacity 0.3s, transform 0.3s';
      activeCard.style.opacity = '0';
      activeCard.style.transform = 'translateX(-100%)';
      setTimeout(() => activeCard.remove(), 300);
      hideMenu();
    });
  })();

  // =============================================
  //  重新渲染新增的 Lucide 图标
  // =============================================
  lucide.createIcons({ icons: lucide.icons });

  // =============================================
  //  18. 搜索页（事件绑在父元素，避免Lucide替换后失效）
  // =============================================
  (function() {
    const msgNavRight = document.querySelector('#page-messages .nav-right');
    const cancelBtn = document.getElementById('search-cancel');
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    const searchEmpty = document.getElementById('search-empty');

    const contacts = [
      { name: '张伟', avatar: 'images/avatar-zhangwei.png', msg: '好的，方案已经收到了' },
      { name: '李娜', avatar: 'images/avatar-lina.png', msg: '周末一起吃饭吗？' },
      { name: '王明', avatar: 'images/avatar-wangming.png', msg: '[语音消息] 0:12' },
      { name: '赵雪', avatar: 'images/avatar-zhaoxue.png', msg: '我发了一个红包，快来领取' },
      { name: '设计组(5)', avatar: 'images/avatar-shejigroup.png', msg: '[图片]' },
    ];

    if (msgNavRight) {
      msgNavRight.addEventListener('click', function(e) {
        const target = e.target.closest('#msg-search-btn');
        if (target) {
          navigateTo('page-search', { direction: 'forward' });
          setTimeout(() => searchInput && searchInput.focus(), 400);
        }
      });
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', function() {
        if (searchInput) searchInput.value = '';
        renderResults('');
        navigateTo('page-messages', { direction: 'back' });
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', function() {
        renderResults(this.value.trim());
      });
    }

    function renderResults(query) {
      if (!query) {
        searchResults.innerHTML = '';
        searchResults.appendChild(searchEmpty);
        searchEmpty.style.display = 'flex';
        return;
      }

      searchEmpty.style.display = 'none';
      const filtered = contacts.filter(c =>
        c.name.includes(query) || c.msg.includes(query)
      );

      if (filtered.length === 0) {
        searchResults.innerHTML = '<div class="search-empty" style="display:flex"><p>未找到相关结果</p></div>';
        return;
      }

      let html = '<div class="search-section-title">联系人与聊天</div>';
      filtered.forEach(c => {
        const highlightName = c.name.replace(new RegExp(query, 'g'), '<span class="search-highlight">' + query + '</span>');
        const highlightMsg = c.msg.replace(new RegExp(query, 'g'), '<span class="search-highlight">' + query + '</span>');
        html +=
          '<div class="search-result-item">' +
            '<img class="search-result-avatar" src="' + c.avatar + '" alt="' + c.name + '">' +
            '<div class="search-result-info">' +
              '<div class="search-result-name">' + highlightName + '</div>' +
              '<div class="search-result-msg">' + highlightMsg + '</div>' +
            '</div>' +
          '</div>';
      });
      searchResults.innerHTML = html;
    }
  })();

  // =============================================
  //  19. +号菜单（事件委托）
  // =============================================
  (function() {
    const msgNavRight = document.querySelector('#page-messages .nav-right');
    const plusMenu = document.getElementById('plus-menu');
    const plusOverlay = document.getElementById('plus-overlay');

    if (msgNavRight && plusMenu && plusOverlay) {
      msgNavRight.addEventListener('click', function(e) {
        const target = e.target.closest('#msg-plus-btn');
        if (target) {
          e.stopPropagation();
          plusMenu.classList.toggle('show');
          plusOverlay.classList.toggle('show');
        }
      });

      plusOverlay.addEventListener('click', function() {
        plusMenu.classList.remove('show');
        plusOverlay.classList.remove('show');
      });

      const actionMap = {
        'group': 'page-create-group',
        'add-friend': 'page-add-friend',
        'scan': 'page-scan',
        'pay': 'page-payment'
      };
      
      plusMenu.querySelectorAll('.plus-menu-item').forEach(item => {
        item.addEventListener('click', function() {
          plusMenu.classList.remove('show');
          plusOverlay.classList.remove('show');
          const action = this.dataset.action;
          if (actionMap[action]) {
            navigateTo(actionMap[action], { direction: 'forward' });
          }
        });
      });
    }
  })();

  // =============================================
  //  20. 发起群聊 - 联系人选择
  // =============================================
  (function() {
    const confirmBtn = document.getElementById('create-group-confirm');
    const selectedBar = document.getElementById('selected-bar');
    const selectedAvatars = document.getElementById('selected-avatars');
    const items = document.querySelectorAll('.group-contact-item');

    if (!confirmBtn || !items.length) return;

    items.forEach(item => {
      item.addEventListener('click', function() {
        this.classList.toggle('selected');
        updateSelection();
      });
    });

    function updateSelection() {
      const selected = document.querySelectorAll('.group-contact-item.selected');
      const count = selected.length;
      confirmBtn.textContent = '完成(' + count + ')';
      confirmBtn.disabled = count === 0;

      if (selectedAvatars) {
        selectedAvatars.innerHTML = '';
        selected.forEach(item => {
          const img = item.querySelector('img');
          if (img) {
            const clone = document.createElement('img');
            clone.src = img.src;
            clone.alt = img.alt;
            selectedAvatars.appendChild(clone);
          }
        });
      }
      if (selectedBar) {
        selectedBar.style.display = count > 0 ? 'block' : 'none';
      }
    }
  })();

  // =============================================
  //  21. 收付款 Tab 切换
  // =============================================
  (function() {
    const tabs = document.querySelectorAll('.payment-tab');
    const panels = document.querySelectorAll('.payment-panel');

    tabs.forEach(tab => {
      tab.addEventListener('click', function() {
        tabs.forEach(t => t.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));
        this.classList.add('active');
        const target = this.dataset.payTab;
        const panel = document.getElementById('panel-' + target);
        if (panel) panel.classList.add('active');
      });
    });
  })();

  // 最终渲染所有 Lucide 图标（包括新增页面）
  lucide.createIcons({ icons: lucide.icons });

  // =============================================
  //  22. 聊天页+号功能面板 & 表情面板
  // =============================================
  (function() {
    const app = document.getElementById('app');
    
    const moreActionMap = {
      'album': null,
      'camera': 'page-camera',
      'redpacket': 'page-send-redpacket',
      'transfer': 'page-transfer'
    };
    
    app.addEventListener('click', function(e) {
      // 群聊 管理员/成员视角切换
      if (e.target.closest('#group-admin-view-toggle')) {
        var page = document.getElementById('page-group-chat');
        var badge = document.getElementById('group-admin-view-toggle');
        if (page && badge) {
          var isMember = page.classList.toggle('member-view');
          badge.classList.toggle('member-view', isMember);
          badge.title = isMember ? '成员视角（点击切换为管理员视角）' : '管理员视角（点击切换为成员视角）';
          badge.textContent = isMember ? '成' : '管';
        }
        return;
      }

      // 群聊设置按钮
      if (e.target.closest('#group-settings-btn')) {
        navigateTo('page-group-settings', { direction: 'forward' });
        return;
      }

      // +号按钮点击 - 切换功能面板
      const plusBtn = e.target.closest('#chat-plus-btn, #group-plus-btn');
      if (plusBtn) {
        const chatPage = plusBtn.closest('.page');
        if (!chatPage) return;
        const morePanel = chatPage.querySelector('.chat-more-panel');
        const emojiPanel = chatPage.querySelector('.emoji-panel');
        if (morePanel) {
          const isShowing = morePanel.classList.contains('show');
          if (emojiPanel) emojiPanel.classList.remove('show');
          morePanel.classList.toggle('show', !isShowing);
        }
        return;
      }
      
      // 笑脸按钮点击 - 切换表情面板
      const smileBtn = e.target.closest('#chat-smile-btn, #group-smile-btn');
      if (smileBtn) {
        const chatPage = smileBtn.closest('.page');
        if (!chatPage) return;
        const emojiPanel = chatPage.querySelector('.emoji-panel');
        const morePanel = chatPage.querySelector('.chat-more-panel');
        if (emojiPanel) {
          const isShowing = emojiPanel.classList.contains('show');
          if (morePanel) morePanel.classList.remove('show');
          emojiPanel.classList.toggle('show', !isShowing);
        }
        return;
      }
      
      // 功能面板中的功能项点击
      const moreItem = e.target.closest('.more-grid-item');
      if (moreItem) {
        const action = moreItem.dataset.more;
        const chatPage = moreItem.closest('.page');
        const morePanel = chatPage ? chatPage.querySelector('.chat-more-panel') : null;
        if (morePanel) morePanel.classList.remove('show');
        
        if (action === 'album') {
          if (chatPage) {
            const area = chatPage.querySelector('.messages-area');
            if (area) {
              const row = document.createElement('div');
              row.className = 'message-row self';
              row.innerHTML = '<div class="bubble self-bubble" style="padding:4px"><img src="images/game-banner.png" style="width:180px;border-radius:12px;display:block" alt="图片"></div><img class="msg-avatar" src="images/chat-me1.png" alt="我">';
              area.appendChild(row);
              area.scrollTop = area.scrollHeight;
            }
          }
        } else if (moreActionMap[action]) {
          navigateTo(moreActionMap[action], { direction: 'forward' });
        }
        return;
      }
      
      // 表情Tab切换
      const emojiTab = e.target.closest('.emoji-tab');
      if (emojiTab) {
        const panel = emojiTab.closest('.emoji-panel');
        if (panel) {
          panel.querySelectorAll('.emoji-tab').forEach(t => t.classList.remove('active'));
          panel.querySelectorAll('.emoji-tab-content').forEach(c => c.classList.remove('active'));
          emojiTab.classList.add('active');
          const tabType = emojiTab.dataset.emojiTab;
          const target = panel.querySelector('.emoji-tab-content[data-tab-type="' + tabType + '"]');
          if (target) target.classList.add('active');
        }
        return;
      }

      // 收藏表情包（GIF动图）点击发送
      const stickerItem = e.target.closest('.sticker-item');
      if (stickerItem && stickerItem.dataset.gif) {
        const chatPage = stickerItem.closest('.page');
        if (chatPage) {
          const area = chatPage.querySelector('.messages-area');
          const emojiPanel = chatPage.querySelector('.emoji-panel');
          if (area) {
            const gifUrl = stickerItem.dataset.gif;
            const row = document.createElement('div');
            row.className = 'message-row self';
            row.innerHTML = '<div class="bubble self-bubble" style="background:transparent;box-shadow:none;padding:4px"><img src="' + gifUrl + '" style="width:120px;border-radius:10px;display:block" alt="表情"></div><img class="msg-avatar" src="images/chat-me1.png" alt="我">';
            area.appendChild(row);
            area.scrollTop = area.scrollHeight;
          }
          if (emojiPanel) emojiPanel.classList.remove('show');
        }
        return;
      }

      // 添加表情包按钮
      const addStickerBtn = e.target.closest('.emoji-add-sticker-btn');
      if (addStickerBtn) {
        const modal = document.getElementById('sticker-modal');
        if (modal) modal.classList.add('show');
        return;
      }

      // 表情点击
      const emojiItem = e.target.closest('.emoji-item');
      if (emojiItem) {
        const chatPage = emojiItem.closest('.page');
        if (chatPage) {
          const input = chatPage.querySelector('.chat-input');
          if (input) {
            input.value += emojiItem.textContent;
            input.focus();
          }
        }
        return;
      }
      
      // 表情删除
      const delBtn = e.target.closest('.emoji-delete-btn');
      if (delBtn) {
        const chatPage = delBtn.closest('.page');
        if (chatPage) {
          const input = chatPage.querySelector('.chat-input');
          if (input && input.value.length > 0) {
            const arr = [...input.value];
            arr.pop();
            input.value = arr.join('');
          }
        }
        return;
      }
      
      // 表情发送
      const sendBtn = e.target.closest('.emoji-send-btn');
      if (sendBtn) {
        const chatPage = sendBtn.closest('.page');
        if (chatPage) {
          const input = chatPage.querySelector('.chat-input');
          const emojiPanel = chatPage.querySelector('.emoji-panel');
          if (input && input.value.trim()) {
            const area = chatPage.querySelector('.messages-area');
            if (area) {
              const row = document.createElement('div');
              row.className = 'message-row self';
              row.innerHTML = '<div class="bubble self-bubble">' + input.value + '</div><img class="msg-avatar" src="images/chat-me1.png" alt="我">';
              area.appendChild(row);
              area.scrollTop = area.scrollHeight;
            }
            input.value = '';
          }
          if (emojiPanel) emojiPanel.classList.remove('show');
        }
        return;
      }

      // 表情包商店弹窗关闭
      const stickerModalClose = e.target.closest('#sticker-modal-close');
      if (stickerModalClose) {
        document.getElementById('sticker-modal').classList.remove('show');
        return;
      }
      if (e.target.id === 'sticker-modal') {
        e.target.classList.remove('show');
        return;
      }

      // 表情包下载按钮
      const dlBtn = e.target.closest('.sticker-download-btn');
      if (dlBtn && !dlBtn.classList.contains('downloaded')) {
        dlBtn.textContent = '已下载';
        dlBtn.classList.add('downloaded');
        return;
      }

      // 全局事件委托处理返回按钮
      const backBtn = e.target.closest('[data-back]');
      if (backBtn) {
        const targetPage = backBtn.getAttribute('data-back');
        if (targetPage) {
          navigateTo(targetPage, { direction: 'back' });
        }
      }
    });
  })();

  // =============================================
  //  24. 通讯录快捷入口（新朋友 & 群聊列表）
  // =============================================
  (function() {
    var app = document.getElementById('app');
    app.addEventListener('click', function(e) {
      // 新的朋友
      var nf = e.target.closest('#shortcut-new-friend');
      if (nf) { navigateTo('page-new-friends', { direction: 'forward' }); return; }

      // 群聊列表
      var gl = e.target.closest('#shortcut-groups');
      if (gl) { navigateTo('page-group-list', { direction: 'forward' }); return; }

      // 好友申请接受按钮
      var acceptBtn = e.target.closest('.friend-req-btn.accept');
      if (acceptBtn) {
        acceptBtn.textContent = '已添加';
        acceptBtn.classList.remove('accept');
        acceptBtn.classList.add('accepted');
        acceptBtn.disabled = true;
        return;
      }

      // 群聊列表项点击
      var groupItem = e.target.closest('.group-list-item');
      if (groupItem) {
        var goto = groupItem.dataset.goto;
        if (goto) {
          navigateTo(goto, { direction: 'forward' });
        }
        return;
      }
    });
  })();

  // =============================================
  //  25. "我的"页面子页面导航 & toggle交互
  // =============================================
  (function() {
    var app = document.getElementById('app');

    app.addEventListener('click', function(e) {
      // 设置页 toggle 开关
      var toggle = e.target.closest('.settings-toggle-row .toggle-switch');
      if (toggle && toggle.id !== 'theme-toggle') {
        toggle.classList.toggle('active');
        return;
      }

      // 个人信息页
      var profileCard = e.target.closest('#profile-card-btn');
      if (profileCard) {
        navigateTo('page-my-info', { direction: 'forward' });
        return;
      }

      // 会员中心
      var vipBtn = e.target.closest('#menu-vip');
      if (vipBtn) {
        navigateTo('page-vip', { direction: 'forward' });
        return;
      }

      // 通知设置
      var notifBtn = e.target.closest('#menu-notification');
      if (notifBtn) {
        navigateTo('page-notification', { direction: 'forward' });
        return;
      }

      // 隐私设置
      var privacyBtn = e.target.closest('#menu-privacy');
      if (privacyBtn) {
        navigateTo('page-privacy', { direction: 'forward' });
        return;
      }

      // 关于50聊天
      var aboutBtn = e.target.closest('#menu-about');
      if (aboutBtn) {
        navigateTo('page-about', { direction: 'forward' });
        return;
      }
    });
  })();

  // =============================================
  //  26. 更换头像 & 编辑昵称
  // =============================================
  (function() {
    var app = document.getElementById('app');
    var selectedAvatar = null;

    app.addEventListener('click', function(e) {
      if (e.target.closest('#change-avatar-btn')) {
        navigateTo('page-change-avatar', { direction: 'forward' });
        return;
      }

      var avatarOpt = e.target.closest('.avatar-option');
      if (avatarOpt) {
        document.querySelectorAll('.avatar-option').forEach(function(o){ o.classList.remove('selected'); });
        avatarOpt.classList.add('selected');
        selectedAvatar = avatarOpt.dataset.avatar;
        document.getElementById('avatar-preview-img').src = selectedAvatar;
        return;
      }

      if (e.target.closest('#avatar-confirm-btn')) {
        if (selectedAvatar) {
          var infoAvatar = document.querySelector('#page-my-info .info-avatar-large');
          if (infoAvatar) infoAvatar.src = selectedAvatar;
          var profileAvatar = document.querySelector('#page-profile .profile-avatar');
          if (profileAvatar) profileAvatar.src = selectedAvatar;
        }
        navigateTo('page-my-info', { direction: 'back' });
        return;
      }

      if (e.target.closest('#edit-name-row')) {
        var nameRow = document.getElementById('edit-name-row');
        var val = nameRow ? nameRow.querySelector('.settings-value') : null;
        var currentName = val ? val.childNodes[0].textContent.trim() : '小明';
        var input = document.getElementById('edit-name-input');
        if (input) input.value = currentName;
        navigateTo('page-edit-name', { direction: 'forward' });
        setTimeout(function() {
          if (input) input.focus();
        }, 400);
        return;
      }

      if (e.target.closest('#edit-name-clear')) {
        var inp = document.getElementById('edit-name-input');
        if (inp) { inp.value = ''; inp.focus(); }
        return;
      }

      if (e.target.closest('#save-name-btn')) {
        var newName = document.getElementById('edit-name-input').value.trim();
        if (newName) {
          var nameRow = document.getElementById('edit-name-row');
          if (nameRow) {
            var valEl = nameRow.querySelector('.settings-value');
            if (valEl) valEl.childNodes[0].textContent = newName + ' ';
          }
          var profileName = document.querySelector('#page-profile .profile-name');
          if (profileName) profileName.textContent = newName;
        }
        navigateTo('page-my-info', { direction: 'back' });
        return;
      }
    });
  })();

  // =============================================
  //  27. 修改性别 / 地区 / 签名 页面交互
  // =============================================
  (function() {
    var app = document.getElementById('app');

    app.addEventListener('click', function(e) {
      // 点击性别行 → 跳转修改性别页
      if (e.target.closest('#edit-gender-row')) {
        var currentGender = document.querySelector('#edit-gender-row .settings-value').childNodes[0].textContent.trim();
        document.querySelectorAll('#page-edit-gender .select-option-item').forEach(function(item) {
          item.classList.toggle('selected', item.dataset.gender === currentGender);
        });
        navigateTo('page-edit-gender', { direction: 'forward' });
        return;
      }

      // 点击地区行 → 跳转修改地区页
      if (e.target.closest('#edit-region-row')) {
        var currentRegion = document.querySelector('#edit-region-row .settings-value').childNodes[0].textContent.trim();
        document.querySelectorAll('#region-list .select-option-item').forEach(function(item) {
          item.classList.toggle('selected', item.dataset.region === currentRegion);
        });
        var searchInput = document.getElementById('region-search-input');
        if (searchInput) searchInput.value = '';
        document.querySelectorAll('#region-list .select-option-item').forEach(function(item) {
          item.style.display = '';
        });
        navigateTo('page-edit-region', { direction: 'forward' });
        return;
      }

      // 点击签名行 → 跳转修改签名页
      if (e.target.closest('#edit-signature-row')) {
        var currentSig = document.querySelector('#edit-signature-row .settings-value').childNodes[0].textContent.trim();
        var textarea = document.getElementById('signature-textarea');
        if (textarea) {
          textarea.value = currentSig;
          document.getElementById('signature-count').textContent = textarea.value.length;
        }
        navigateTo('page-edit-signature', { direction: 'forward' });
        setTimeout(function() {
          if (textarea) textarea.focus();
        }, 400);
        return;
      }

      // 性别选择
      var genderItem = e.target.closest('#page-edit-gender .select-option-item[data-gender]');
      if (genderItem) {
        document.querySelectorAll('#page-edit-gender .select-option-item').forEach(function(item) {
          item.classList.remove('selected');
        });
        genderItem.classList.add('selected');
        var gender = genderItem.dataset.gender;
        var genderVal = document.querySelector('#edit-gender-row .settings-value');
        if (genderVal) genderVal.childNodes[0].textContent = gender + ' ';
        setTimeout(function() {
          navigateTo('page-my-info', { direction: 'back' });
        }, 300);
        return;
      }

      // 地区选择
      var regionItem = e.target.closest('#page-edit-region .select-option-item[data-region]');
      if (regionItem) {
        document.querySelectorAll('#region-list .select-option-item').forEach(function(item) {
          item.classList.remove('selected');
        });
        regionItem.classList.add('selected');
        var region = regionItem.dataset.region;
        var regionVal = document.querySelector('#edit-region-row .settings-value');
        if (regionVal) regionVal.childNodes[0].textContent = region + ' ';
        setTimeout(function() {
          navigateTo('page-my-info', { direction: 'back' });
        }, 300);
        return;
      }

      // 保存签名
      if (e.target.closest('#save-signature-btn')) {
        var textarea = document.getElementById('signature-textarea');
        var newSig = textarea ? textarea.value.trim() : '';
        if (newSig) {
          var sigVal = document.querySelector('#edit-signature-row .settings-value');
          if (sigVal) sigVal.childNodes[0].textContent = newSig + ' ';
        }
        navigateTo('page-my-info', { direction: 'back' });
        return;
      }
    });

    // 地区搜索过滤
    var regionSearchInput = document.getElementById('region-search-input');
    if (regionSearchInput) {
      regionSearchInput.addEventListener('input', function() {
        var query = this.value.trim().toLowerCase();
        document.querySelectorAll('#region-list .select-option-item').forEach(function(item) {
          var city = item.dataset.region || '';
          item.style.display = city.toLowerCase().indexOf(query) >= 0 ? '' : 'none';
        });
      });
    }

    // 签名字数计数
    var sigTextarea = document.getElementById('signature-textarea');
    if (sigTextarea) {
      sigTextarea.addEventListener('input', function() {
        document.getElementById('signature-count').textContent = this.value.length;
      });
    }
  })();

  // =============================================
  //  28. 注册页交互
  // =============================================
  (function() {
    var goRegister = document.getElementById('go-register');
    if (goRegister) {
      goRegister.addEventListener('click', function() {
        navigateTo('page-register', { direction: 'forward' });
      });
    }

    var goLogin = document.getElementById('go-login');
    if (goLogin) {
      goLogin.addEventListener('click', function() {
        navigateTo('page-login', { direction: 'back' });
      });
    }

    var regCodeBtn = document.getElementById('reg-code-btn');
    var regCountdown = 0;
    var regTimer = null;
    if (regCodeBtn) {
      regCodeBtn.addEventListener('click', function() {
        if (regCountdown > 0) return;
        regCountdown = 60;
        regCodeBtn.disabled = true;
        regCodeBtn.textContent = '60s后重发';
        regCodeBtn.classList.add('disabled');

        regTimer = setInterval(function() {
          regCountdown--;
          if (regCountdown <= 0) {
            clearInterval(regTimer);
            regTimer = null;
            regCodeBtn.disabled = false;
            regCodeBtn.textContent = '获取验证码';
            regCodeBtn.classList.remove('disabled');
          } else {
            regCodeBtn.textContent = regCountdown + 's后重发';
          }
        }, 1000);
      });
    }

    var btnRegister = document.getElementById('btn-register');
    if (btnRegister) {
      btnRegister.addEventListener('click', function() {
        var nickname = document.getElementById('reg-nickname').value.trim();
        var phone = document.getElementById('reg-phone').value.trim();
        var pwd = document.getElementById('reg-password').value;
        var pwd2 = document.getElementById('reg-password2').value;

        if (!nickname) { alert('请输入昵称'); return; }
        if (!phone) { alert('请输入手机号'); return; }
        if (!pwd) { alert('请设置密码'); return; }
        if (pwd !== pwd2) { alert('两次密码不一致'); return; }

        alert('注册成功！');
        navigateTo('page-messages', { direction: 'forward' });
      });
    }
  })();

  // =============================================
  //  29. 注册页 — 头像选择交互
  // =============================================
  (function() {
    var regAvatarArea = document.getElementById('reg-avatar-area');
    if (regAvatarArea) {
      regAvatarArea.addEventListener('click', function() {
        navigateTo('page-reg-avatar', { direction: 'forward' });
      });
    }

    var regAvatarGrid = document.getElementById('reg-avatar-grid');
    var regAvatarPreview = document.getElementById('reg-avatar-preview');
    var selectedRegAvatar = '';

    if (regAvatarGrid) {
      regAvatarGrid.addEventListener('click', function(e) {
        var opt = e.target.closest('.avatar-option');
        if (!opt) return;
        regAvatarGrid.querySelectorAll('.avatar-option').forEach(function(o) { o.classList.remove('selected'); });
        opt.classList.add('selected');
        selectedRegAvatar = opt.getAttribute('data-avatar');
        if (regAvatarPreview) regAvatarPreview.src = selectedRegAvatar;
      });
    }

    var regAvatarConfirm = document.getElementById('reg-avatar-confirm');
    if (regAvatarConfirm) {
      regAvatarConfirm.addEventListener('click', function() {
        if (!selectedRegAvatar) { alert('请先选择一个头像'); return; }
        applyRegAvatar(selectedRegAvatar);
      });
    }

    function applyRegAvatar(src) {
      var placeholder = document.getElementById('reg-avatar-placeholder');
      var imgEl = document.getElementById('reg-avatar-img');
      if (placeholder) placeholder.style.display = 'none';
      if (imgEl) {
        imgEl.src = src;
        imgEl.style.display = 'block';
      }
      navigateTo('page-register', { direction: 'back' });
    }

    // 从相册选择
    var albumPick = document.getElementById('reg-album-pick');
    var albumInput = document.getElementById('reg-album-input');
    if (albumPick && albumInput) {
      albumPick.addEventListener('click', function() {
        albumInput.click();
      });

      albumInput.addEventListener('change', function(e) {
        var file = e.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function(ev) {
          var dataUrl = ev.target.result;
          var cropImg = document.getElementById('crop-preview-img');
          var cropLg = document.getElementById('crop-result-lg');
          var cropMd = document.getElementById('crop-result-md');
          var cropSm = document.getElementById('crop-result-sm');
          if (cropImg) cropImg.src = dataUrl;
          if (cropLg) cropLg.src = dataUrl;
          if (cropMd) cropMd.src = dataUrl;
          if (cropSm) cropSm.src = dataUrl;
          window._regCropDataUrl = dataUrl;
          navigateTo('page-reg-crop', { direction: 'forward' });
        };
        reader.readAsDataURL(file);
        albumInput.value = '';
      });
    }

    // 裁剪页确认
    var cropConfirm = document.getElementById('crop-confirm-btn');
    if (cropConfirm) {
      cropConfirm.addEventListener('click', function() {
        var src = window._regCropDataUrl;
        if (!src) return;
        selectedRegAvatar = src;
        if (regAvatarPreview) regAvatarPreview.src = src;
        regAvatarGrid.querySelectorAll('.avatar-option').forEach(function(o) { o.classList.remove('selected'); });
        applyRegAvatar(src);
      });
    }
  })();

  // =============================================
  //  30. 发红包页交互
  // =============================================
  (function() {
    var rpTypeTabs = document.querySelectorAll('.rp-type-tab');
    var rpCount = document.getElementById('rp-count');
    var rpAmount = document.getElementById('rp-amount');
    var rpSummary = document.getElementById('rp-summary');
    var rpHint = document.getElementById('rp-hint');
    var rpAmountLabel = document.getElementById('rp-amount-label');
    var rpSubmit = document.getElementById('rp-submit');
    var currentRpType = 'lucky';

    rpTypeTabs.forEach(function(tab) {
      tab.addEventListener('click', function() {
        rpTypeTabs.forEach(function(t) { t.classList.remove('active'); });
        tab.classList.add('active');
        currentRpType = tab.getAttribute('data-rp-type');
        if (rpAmountLabel) {
          rpAmountLabel.textContent = currentRpType === 'lucky' ? '总金额' : '单个金额';
        }
        updateRpSummary();
      });
    });

    function updateRpSummary() {
      if (!rpSummary || !rpHint) return;
      var count = parseInt(rpCount ? rpCount.value : 1) || 0;
      var amount = parseFloat(rpAmount ? rpAmount.value : 0) || 0;
      if (amount <= 0) {
        rpHint.textContent = '未填写金额';
        rpSummary.textContent = '';
        return;
      }
      rpHint.textContent = '';
      if (currentRpType === 'lucky') {
        rpSummary.textContent = count + '个红包，共' + amount.toFixed(2) + '元';
      } else {
        var total = (count * amount).toFixed(2);
        rpSummary.textContent = count + '个红包，每个' + amount.toFixed(2) + '元，共' + total + '元';
      }
    }

    if (rpCount) rpCount.addEventListener('input', updateRpSummary);
    if (rpAmount) rpAmount.addEventListener('input', updateRpSummary);

    if (rpSubmit) {
      rpSubmit.addEventListener('click', function(e) {
        e.stopPropagation();
        var count = parseInt(rpCount ? rpCount.value : 1) || 0;
        var amount = parseFloat(rpAmount ? rpAmount.value : 0) || 0;
        if (amount <= 0) { alert('请输入金额'); return; }
        if (count <= 0) { alert('请输入红包个数'); return; }
        var typeText = currentRpType === 'lucky' ? '拼手气红包' : '普通红包';
        alert('已发送' + count + '个' + typeText + '！');
        navigateTo('page-chat', { direction: 'back' });
      });
    }

    document.addEventListener('click', function(e) {
      if (e.target.closest('#rp-submit')) {
        var count = parseInt(rpCount ? rpCount.value : 1) || 0;
        var amount = parseFloat(rpAmount ? rpAmount.value : 0) || 0;
        if (amount <= 0) { alert('请输入金额'); return; }
        if (count <= 0) { alert('请输入红包个数'); return; }
        var typeText = currentRpType === 'lucky' ? '拼手气红包' : '普通红包';
        alert('已发送' + count + '个' + typeText + '！');
        navigateTo('page-chat', { direction: 'back' });
      }
    });
  })();

  // =============================================
  //  31. 拆红包页交互
  // =============================================
  (function() {
    var app = document.getElementById('app');
    var rpLastChatPage = 'page-chat';

    app.addEventListener('click', function(e) {
      // 点击红包卡片 → 进入拆红包页
      var rpCard = e.target.closest('.red-packet-card');
      if (rpCard) {
        rpLastChatPage = currentPage;
        var envelope = document.getElementById('rp-envelope');
        var result = document.getElementById('rp-opened-result');
        if (envelope) {
          envelope.style.display = '';
          envelope.classList.remove('opening');
        }
        if (result) result.style.display = 'none';
        var openBtn = document.getElementById('rp-open-btn');
        if (openBtn) {
          openBtn.classList.remove('spinning');
        }
        navigateTo('page-open-redpacket', { direction: 'fade' });
        return;
      }

      // 点击"開"按钮
      var openBtn = e.target.closest('#rp-open-btn');
      if (openBtn && !openBtn.classList.contains('spinning')) {
        openBtn.classList.add('spinning');

        setTimeout(function() {
          var envelope = document.getElementById('rp-envelope');
          var result = document.getElementById('rp-opened-result');
          if (envelope) {
            envelope.classList.add('opening');
          }

          var total = +(Math.random() * 180 + 20).toFixed(2);
          var myAmount = +(Math.random() * (total * 0.5) + 1).toFixed(2);
          var remaining = +(total - myAmount).toFixed(2);
          var linaAmount = +(Math.random() * remaining * 0.7 + 0.5).toFixed(2);
          var wmAmount = +(remaining - linaAmount).toFixed(2);
          if (wmAmount < 0.01) wmAmount = 0.01;

          var numEl = document.getElementById('rp-opened-num');
          if (numEl) numEl.textContent = myAmount.toFixed(2);

          var detailItems = document.querySelectorAll('#page-open-redpacket .rp-detail-item .rp-detail-amount');
          if (detailItems[0]) detailItems[0].textContent = '¥' + myAmount.toFixed(2);
          if (detailItems[1]) detailItems[1].textContent = '¥' + linaAmount.toFixed(2);
          if (detailItems[2]) detailItems[2].textContent = '¥' + wmAmount.toFixed(2);

          var summaryEl = document.querySelector('#page-open-redpacket .rp-detail-summary');
          if (summaryEl) summaryEl.textContent = '共3人领取，总金额 ¥' + total.toFixed(2);

          setTimeout(function() {
            if (envelope) envelope.style.display = 'none';
            if (result) {
              result.style.display = '';
              result.style.animation = 'none';
              result.offsetHeight;
              result.style.animation = '';
            }
            createConfetti();
          }, 500);
        }, 500);
        return;
      }

      // 关闭按钮
      var closeBtn = e.target.closest('#rp-open-close');
      if (closeBtn) {
        navigateTo(rpLastChatPage, { direction: 'fade' });
        return;
      }
    });

    // 独立绑定关闭/返回按钮（防止Lucide替换导致事件丢失）
    document.addEventListener('click', function(e) {
      if (e.target.closest('#rp-open-close') || e.target.closest('#rp-back-btn')) {
        navigateTo(rpLastChatPage, { direction: 'fade' });
      }
    });

    function createConfetti() {
      var colors = ['#FFD700', '#F4C430', '#DAA520', '#FFB347', '#FF6B6B', '#FF4444', '#FFA500', '#FFEC8B'];
      var container = document.getElementById('page-open-redpacket');
      if (!container) return;
      var rect = container.getBoundingClientRect();

      for (var i = 0; i < 30; i++) {
        (function(index) {
          setTimeout(function() {
            var el = document.createElement('div');
            el.className = 'rp-confetti' + (Math.random() > 0.6 ? ' star' : '');
            var size = Math.random() * 8 + 4;
            el.style.width = size + 'px';
            el.style.height = size + 'px';
            el.style.background = colors[Math.floor(Math.random() * colors.length)];
            el.style.left = (rect.left + Math.random() * rect.width) + 'px';
            el.style.top = (rect.top + Math.random() * rect.height * 0.4) + 'px';
            el.style.animationDuration = (1.5 + Math.random() * 1.5) + 's';
            el.style.animationDelay = (Math.random() * 0.3) + 's';
            document.body.appendChild(el);
            setTimeout(function() { el.remove(); }, 3000);
          }, index * 40);
        })(i);
      }
    }
  })();

  // 32. 群管理员和禁言交互
  (function() {
    document.getElementById('app').addEventListener('click', function(e) {
      if (e.target.closest('#gs-admin-row')) {
        navigateTo('page-group-admin', { direction: 'forward' });
      }
    });

    var muteAllCheckbox = document.getElementById('gs-mute-all');
    if (muteAllCheckbox) {
      muteAllCheckbox.addEventListener('change', function() {
        alert(this.checked ? '已开启全体禁言' : '已关闭全体禁言');
      });
    }

    document.addEventListener('click', function(e) {
      var addBtn = e.target.closest('.admin-add-btn');
      if (addBtn) {
        addBtn.textContent = '已设置';
        addBtn.disabled = true;
        addBtn.style.opacity = '0.5';
        return;
      }

      var removeBtn = e.target.closest('.admin-remove-btn');
      if (removeBtn) {
        if (confirm('确定移除该管理员？')) {
          var item = removeBtn.closest('.admin-member-item');
          if (item) {
            item.style.transition = 'opacity 0.3s';
            item.style.opacity = '0';
            setTimeout(function() { item.style.display = 'none'; }, 300);
          }
        }
        return;
      }

      var remarkBtn = e.target.closest('.admin-remark-btn');
      if (remarkBtn) {
        var name = remarkBtn.getAttribute('data-remark-target');
        var avatarMap = { '李娜': 'lina', '张伟': 'zhangwei', '王明': 'wangming', '赵雪': 'zhaoxue' };
        window._remarkEditTarget = name;
        var avatarEl = document.getElementById('remark-edit-avatar');
        var nameEl = document.getElementById('remark-edit-name');
        var inputEl = document.getElementById('remark-edit-input');
        if (avatarEl) avatarEl.src = 'images/avatar-' + (avatarMap[name] || 'lina') + '.png';
        if (avatarEl) avatarEl.alt = name;
        if (nameEl) nameEl.textContent = name;
        if (inputEl) inputEl.value = (window._groupRemarks && window._groupRemarks[name]) || '';
        navigateTo('page-group-remark-edit', { direction: 'forward' });
        return;
      }

      var muteBtn = e.target.closest('.admin-mute-btn');
      if (muteBtn) {
        var target = muteBtn.getAttribute('data-mute-target');
        var statusEl = document.getElementById('mute-' + target);
        if (muteBtn.classList.contains('is-muted')) {
          muteBtn.classList.remove('is-muted');
          muteBtn.textContent = '禁言';
          if (statusEl) { statusEl.textContent = '未禁言'; statusEl.classList.remove('muted'); }
        } else {
          muteBtn.classList.add('is-muted');
          muteBtn.textContent = '解除禁言';
          if (statusEl) { statusEl.textContent = '已禁言'; statusEl.classList.add('muted'); }
        }
        return;
      }

      // 进群审批 - 通过
      var approveBtn = e.target.closest('.admin-approve-btn');
      if (approveBtn) {
        var item = approveBtn.closest('.join-request-item');
        if (item) {
          var name = item.querySelector('.admin-member-name');
          item.style.transition = 'opacity 0.3s, max-height 0.3s';
          item.style.opacity = '0';
          item.style.maxHeight = '0';
          item.style.overflow = 'hidden';
          setTimeout(function() {
            item.remove();
            updateJoinRequestCount();
          }, 300);
          if (name) alert(name.textContent + ' 已通过进群申请');
        }
        return;
      }

      // 进群审批 - 拒绝
      var rejectBtn = e.target.closest('.admin-reject-btn');
      if (rejectBtn) {
        var item = rejectBtn.closest('.join-request-item');
        if (item) {
          var name = item.querySelector('.admin-member-name');
          item.style.transition = 'opacity 0.3s, max-height 0.3s';
          item.style.opacity = '0';
          item.style.maxHeight = '0';
          item.style.overflow = 'hidden';
          setTimeout(function() {
            item.remove();
            updateJoinRequestCount();
          }, 300);
          if (name) alert(name.textContent + ' 的进群申请已拒绝');
        }
        return;
      }
    });

    function updateJoinRequestCount() {
      var items = document.querySelectorAll('.join-request-item');
      var countEl = document.getElementById('join-request-count');
      var emptyEl = document.getElementById('join-request-empty');
      if (countEl) countEl.textContent = items.length;
      if (emptyEl) emptyEl.style.display = items.length === 0 ? 'block' : 'none';
    }
  })();

  // 32b. 群成员备注 - 保存
  (function() {
    if (!window._groupRemarks) window._groupRemarks = {};
    var remarkIdMap = { '李娜': 'lina', '张伟': 'zhangwei', '王明': 'wangming', '赵雪': 'zhaoxue' };

    document.addEventListener('click', function(e) {
      if (e.target.closest('#remark-save-btn')) {
        var name = window._remarkEditTarget;
        var input = document.getElementById('remark-edit-input');
        if (!name || !input) return;
        var value = input.value.trim();
        window._groupRemarks[name] = value || null;

        var displayEl = document.getElementById('remark-' + remarkIdMap[name]);
        if (displayEl) {
          displayEl.textContent = value || '未设置';
          displayEl.classList.toggle('has-remark', !!value);
        }

        document.querySelectorAll('.sender-name[data-sender="' + name + '"]').forEach(function(el) {
          el.textContent = value || name;
        });

        navigateTo('page-group-admin', { direction: 'back' });
      }
    });
  })();

  // 33. 群聊消息长按/右键菜单
  (function() {
    var menuOverlay = document.getElementById('group-msg-menu-overlay');
    var menu = document.getElementById('group-msg-menu');
    var selectedMsg = null;
    var longPressTimer = null;

    function showGroupMsgMenu(x, y, msgEl) {
      selectedMsg = msgEl;
      menu.style.left = Math.min(x, window.innerWidth - 160) + 'px';
      menu.style.top = Math.min(y, window.innerHeight - 250) + 'px';
      menu.classList.add('show');
      menuOverlay.classList.add('show');
    }

    function hideGroupMsgMenu() {
      menu.classList.remove('show');
      menuOverlay.classList.remove('show');
      selectedMsg = null;
    }

    if (menuOverlay) menuOverlay.addEventListener('click', hideGroupMsgMenu);

    var groupChatBody = document.querySelector('#page-group-chat .chat-body');
    if (groupChatBody) {
      groupChatBody.addEventListener('touchstart', function(e) {
        var msgRow = e.target.closest('.message-row');
        if (!msgRow) return;
        longPressTimer = setTimeout(function() {
          var touch = e.touches[0];
          showGroupMsgMenu(touch.clientX, touch.clientY, msgRow);
        }, 600);
      }, { passive: true });

      groupChatBody.addEventListener('touchend', function() {
        clearTimeout(longPressTimer);
      });

      groupChatBody.addEventListener('touchmove', function() {
        clearTimeout(longPressTimer);
      });

      groupChatBody.addEventListener('contextmenu', function(e) {
        var msgRow = e.target.closest('.message-row');
        if (!msgRow) return;
        e.preventDefault();
        showGroupMsgMenu(e.clientX, e.clientY, msgRow);
      });
    }

    document.addEventListener('click', function(e) {
      if (e.target.closest('#gm-recall')) {
        if (selectedMsg) {
          var bubble = selectedMsg.querySelector('.bubble');
          if (bubble) {
            bubble.textContent = '此消息已被管理员撤回';
            bubble.style.color = '#999';
            bubble.style.fontStyle = 'italic';
            bubble.style.background = 'var(--bg-secondary)';
          }
        }
        hideGroupMsgMenu();
        return;
      }
      if (e.target.closest('#gm-mute')) {
        var senderEl = selectedMsg ? selectedMsg.querySelector('.sender-name') : null;
        var name = senderEl ? senderEl.textContent : '该成员';
        alert('已对 ' + name + ' 禁言');
        hideGroupMsgMenu();
        return;
      }
      if (e.target.closest('#gm-copy')) {
        if (selectedMsg) {
          var bubble = selectedMsg.querySelector('.bubble');
          if (bubble) {
            navigator.clipboard.writeText(bubble.textContent).catch(function(){});
            alert('已复制');
          }
        }
        hideGroupMsgMenu();
        return;
      }
      if (e.target.closest('#gm-delete')) {
        if (selectedMsg) {
          selectedMsg.style.transition = 'opacity 0.3s, max-height 0.3s';
          selectedMsg.style.opacity = '0';
          selectedMsg.style.maxHeight = '0';
          selectedMsg.style.overflow = 'hidden';
          setTimeout(function() { selectedMsg.style.display = 'none'; }, 300);
        }
        hideGroupMsgMenu();
        return;
      }
      if (e.target.closest('#gm-reply')) {
        if (selectedMsg) {
          var bubble = selectedMsg.querySelector('.bubble');
          var input = document.querySelector('#page-group-chat .chat-input');
          if (bubble && input) {
            input.value = '回复: ';
            input.focus();
          }
        }
        hideGroupMsgMenu();
        return;
      }
    });
  })();

  // =============================================
  //  33b. 私聊消息右键/长按菜单
  // =============================================
  (function() {
    var chatMenu = document.getElementById('chat-msg-menu');
    var chatMenuTarget = null;
    var chatLongPressTimer = null;

    function showChatMsgMenu(x, y, msgRow) {
      if (!chatMenu) return;
      chatMenuTarget = msgRow;

      var isSelf = msgRow.classList.contains('self');
      var recallItem = chatMenu.querySelector('[data-action="recall"]');
      var editItem = chatMenu.querySelector('[data-action="edit"]');
      if (recallItem) recallItem.style.display = isSelf ? '' : 'none';
      if (editItem) editItem.style.display = isSelf ? '' : 'none';

      chatMenu.style.display = '';
      chatMenu.style.left = Math.min(x, window.innerWidth - 160) + 'px';
      chatMenu.style.top = Math.min(y, window.innerHeight - 150) + 'px';

      if (typeof lucide !== 'undefined') lucide.createIcons();

      setTimeout(function() {
        document.addEventListener('click', hideChatMenu);
      }, 10);
    }

    function hideChatMenu() {
      if (chatMenu) chatMenu.style.display = 'none';
      chatMenuTarget = null;
      document.removeEventListener('click', hideChatMenu);
    }

    var chatPage = document.getElementById('page-chat');
    if (chatPage) {
      var msgArea = chatPage.querySelector('.messages-area');
      if (msgArea) {
        msgArea.addEventListener('contextmenu', function(e) {
          var msgRow = e.target.closest('.message-row');
          if (!msgRow) return;
          e.preventDefault();
          showChatMsgMenu(e.clientX, e.clientY, msgRow);
        });

        msgArea.addEventListener('touchstart', function(e) {
          var msgRow = e.target.closest('.message-row');
          if (!msgRow) return;
          chatLongPressTimer = setTimeout(function() {
            var touch = e.touches[0];
            showChatMsgMenu(touch.clientX, touch.clientY, msgRow);
          }, 500);
        });
        msgArea.addEventListener('touchend', function() {
          clearTimeout(chatLongPressTimer);
        });
        msgArea.addEventListener('touchmove', function() {
          clearTimeout(chatLongPressTimer);
        });
      }
    }

    if (chatMenu) {
      chatMenu.addEventListener('click', function(e) {
        var item = e.target.closest('.chat-msg-menu-item');
        if (!item || !chatMenuTarget) return;
        var action = item.getAttribute('data-action');

        if (action === 'copy') {
          var bubble = chatMenuTarget.querySelector('.bubble');
          if (bubble) {
            navigator.clipboard.writeText(bubble.textContent).catch(function(){});
            alert('已复制');
          }
        }

        if (action === 'recall') {
          var bubble = chatMenuTarget.querySelector('.bubble');
          var row = chatMenuTarget;
          var statusRow = row.nextElementSibling;
          row.remove();
          if (statusRow && statusRow.classList.contains('msg-status-row')) {
            statusRow.remove();
          }
        }

        if (action === 'edit') {
          var bubble = chatMenuTarget.querySelector('.bubble');
          if (bubble) {
            var oldText = bubble.textContent;
            var newText = prompt('编辑消息：', oldText);
            if (newText !== null && newText.trim() !== '') {
              bubble.textContent = newText;
              if (!bubble.querySelector('.edited-tag')) {
                var tag = document.createElement('span');
                tag.className = 'edited-tag';
                tag.textContent = ' (已编辑)';
                bubble.appendChild(tag);
              }
            }
          }
        }

        hideChatMenu();
      });
    }
  })();

  // 渲染所有新增图标
  lucide.createIcons({ icons: lucide.icons });

  // =============================================
  //  34. 视频消息播放交互
  // =============================================
  document.getElementById('app').addEventListener('click', function(e) {
    var playBtn = e.target.closest('.video-play-btn');
    if (playBtn) {
      var wrap = playBtn.closest('.msg-video-wrap');
      if (!wrap) return;
      var video = wrap.querySelector('.msg-video-player');
      if (!video) return;
      wrap.classList.add('playing');
      video.play();
      return;
    }
  });

  document.querySelectorAll('.msg-video-player').forEach(function(video) {
    video.addEventListener('ended', function() {
      var wrap = this.closest('.msg-video-wrap');
      if (wrap) {
        wrap.classList.remove('playing');
      }
    });
  });

  // 转账详情页交互
  (function() {
    var transferLastPage = 'page-chat';

    app.addEventListener('click', function(e) {
      var transferCard = e.target.closest('.msg-transfer-card');
      if (transferCard) {
        transferLastPage = currentPage || 'page-chat';
        var btn = document.getElementById('transfer-receive-btn');
        var tag = document.getElementById('transfer-received-tag');
        var statusIcon = document.querySelector('.transfer-status-icon');
        var statusText = document.querySelector('.transfer-status-text');
        var receiveTime = document.getElementById('transfer-receive-time');
        if (btn) btn.style.display = '';
        if (tag) tag.style.display = 'none';
        if (statusIcon) statusIcon.classList.remove('received');
        if (statusText) statusText.textContent = '待收款';
        if (receiveTime) receiveTime.textContent = '-';
        var backBtn = document.querySelector('#page-transfer-detail .back-btn');
        if (backBtn) backBtn.setAttribute('data-back', transferLastPage);
        navigateTo('page-transfer-detail', { direction: 'forward' });
        return;
      }
    });

    var receiveBtn = document.getElementById('transfer-receive-btn');
    if (receiveBtn) {
      receiveBtn.addEventListener('click', function() {
        this.style.display = 'none';
        var tag = document.getElementById('transfer-received-tag');
        var statusIcon = document.querySelector('.transfer-status-icon');
        var statusText = document.querySelector('.transfer-status-text');
        var receiveTime = document.getElementById('transfer-receive-time');
        if (tag) tag.style.display = '';
        if (statusIcon) statusIcon.classList.add('received');
        if (statusText) statusText.textContent = '已收款';
        if (receiveTime) {
          var now = new Date();
          var timeStr = now.getFullYear() + '-' +
            String(now.getMonth()+1).padStart(2,'0') + '-' +
            String(now.getDate()).padStart(2,'0') + ' ' +
            String(now.getHours()).padStart(2,'0') + ':' +
            String(now.getMinutes()).padStart(2,'0');
          receiveTime.textContent = timeStr;
        }
      });
    }
  })();

  // =============================================
  //  35. 群聊 @提及功能
  // =============================================
  (function() {
    var panel = document.getElementById('at-mention-panel');
    var list = document.getElementById('at-mention-list');
    var groupInput = document.getElementById('group-chat-input');
    if (!panel || !list || !groupInput) return;

    var atTriggerPos = -1;
    var isComposing = false;

    groupInput.addEventListener('compositionstart', function() {
      isComposing = true;
    });
    groupInput.addEventListener('compositionend', function() {
      isComposing = false;
      handleInput.call(this);
    });

    function showPanel() {
      panel.classList.add('show');
    }

    function hidePanel() {
      panel.classList.remove('show');
      atTriggerPos = -1;
    }

    function filterMembers(query) {
      var items = list.querySelectorAll('.at-mention-item');
      var q = query.toLowerCase();
      var anyVisible = false;
      items.forEach(function(item) {
        var name = item.getAttribute('data-name') || '';
        var match = !q || name.toLowerCase().indexOf(q) >= 0;
        item.style.display = match ? '' : 'none';
        if (match) anyVisible = true;
      });
      return anyVisible;
    }

    function handleInput() {
      if (isComposing) return;

      var val = this.value;
      var cursor = this.selectionStart;

      if (atTriggerPos >= 0) {
        if (cursor <= atTriggerPos) {
          hidePanel();
          return;
        }
        var query = val.substring(atTriggerPos + 1, cursor);
        if (query.indexOf(' ') >= 0) {
          hidePanel();
          return;
        }
        var hasResults = filterMembers(query);
        if (hasResults) {
          showPanel();
        } else {
          hidePanel();
        }
        return;
      }

      var charBefore = val.charAt(cursor - 1);
      if (charBefore === '@') {
        atTriggerPos = cursor - 1;
        filterMembers('');
        showPanel();
      }
    }

    groupInput.addEventListener('input', handleInput);

    groupInput.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && panel.classList.contains('show')) {
        hidePanel();
        e.preventDefault();
        e.stopPropagation();
      }
      if (e.key === 'Enter' && panel.classList.contains('show')) {
        var visibleItem = list.querySelector('.at-mention-item:not([style*="display: none"])');
        if (visibleItem) {
          insertMention(visibleItem.getAttribute('data-name'));
          e.preventDefault();
          e.stopPropagation();
        }
      }
    });

    list.addEventListener('click', function(e) {
      var item = e.target.closest('.at-mention-item');
      if (!item) return;
      var name = item.getAttribute('data-name');
      insertMention(name);
    });

    function insertMention(name) {
      var val = groupInput.value;
      var before = val.substring(0, atTriggerPos);
      var after = val.substring(groupInput.selectionStart);
      var mention = '@' + name + ' ';
      groupInput.value = before + mention + after;
      var newPos = before.length + mention.length;
      groupInput.setSelectionRange(newPos, newPos);
      groupInput.focus();
      hidePanel();
    }

    document.addEventListener('click', function(e) {
      if (!e.target.closest('.at-mention-panel') && !e.target.closest('#group-chat-input')) {
        hidePanel();
      }
    });
  })();

});
