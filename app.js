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

    if (isGroup && typeof window._recordGroupSpeak === 'function') {
      window._recordGroupSpeak(text);
    }

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
            '<div class="sender-line"><span class="sender-name" data-sender="张伟">张伟</span><span class="vip-badge vip-lv2"><span class="vip-lvl">VIP2</span><span class="vip-icon">🌿</span><span class="vip-text">探索者</span></span></div>' +
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
        window._requirePayPwd(function() {
          alert('提现 ¥' + amount.toFixed(2) + ' 已提交，预计2小时内到账');
          navigateTo('page-wallet', { direction: 'back' });
        });
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

    if (overlay) overlay.addEventListener('click', hideMenu);

    if (pinBtn) pinBtn.addEventListener('click', function() {
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

    if (readBtn) readBtn.addEventListener('click', function() {
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

    if (muteBtn) muteBtn.addEventListener('click', function() {
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

    if (hideBtn) hideBtn.addEventListener('click', function() {
      if (!activeCard) return;
      var cardToHide = activeCard;
      cardToHide.style.transition = 'opacity 0.3s, max-height 0.3s';
      cardToHide.style.opacity = '0';
      cardToHide.style.maxHeight = '0';
      cardToHide.style.overflow = 'hidden';
      setTimeout(function() { cardToHide.remove(); }, 300);
      hideMenu();
    });

    if (deleteBtn) deleteBtn.addEventListener('click', function() {
      if (!activeCard) return;
      var cardToDelete = activeCard;
      cardToDelete.style.transition = 'opacity 0.3s, transform 0.3s';
      cardToDelete.style.opacity = '0';
      cardToDelete.style.transform = 'translateX(-100%)';
      setTimeout(function() { cardToDelete.remove(); }, 300);
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
      if (!searchResults || !searchEmpty) return;
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
        var escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const highlightName = c.name.replace(new RegExp(escapedQuery, 'g'), '<span class="search-highlight">' + query + '</span>');
        const highlightMsg = c.msg.replace(new RegExp(escapedQuery, 'g'), '<span class="search-highlight">' + query + '</span>');
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
          if (action === 'mass-send') {
            showMassSendSheet();
            return;
          }
          if (actionMap[action]) {
            navigateTo(actionMap[action], { direction: 'forward' });
          }
        });
      });
    }
  })();

  // =============================================
  //  20. 发起群聊 - 选择成员 + 设置群信息 + 创建
  // =============================================
  (function() {
    const nextBtn = document.getElementById('create-group-next');
    const selectedBar = document.getElementById('selected-bar');
    const selectedAvatars = document.getElementById('selected-avatars');
    const items = document.querySelectorAll('.group-contact-item');
    const searchInput = document.getElementById('create-group-search-input');

    if (!nextBtn || !items.length) return;

    items.forEach(item => {
      item.addEventListener('click', function() {
        this.classList.toggle('selected');
        updateSelection();
      });
    });

    if (searchInput) {
      searchInput.addEventListener('input', function() {
        const kw = this.value.trim().toLowerCase();
        items.forEach(item => {
          const name = (item.dataset.name || '').toLowerCase();
          item.classList.toggle('hidden', kw !== '' && !name.includes(kw));
        });
      });
    }

    function updateSelection() {
      const selected = document.querySelectorAll('.group-contact-item.selected');
      const count = selected.length;
      nextBtn.textContent = '下一步(' + count + ')';
      nextBtn.disabled = count < 2;

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
        selectedBar.style.display = count > 0 ? 'flex' : 'none';
      }
    }

    nextBtn.addEventListener('click', function() {
      if (this.disabled) return;
      const selected = document.querySelectorAll('.group-contact-item.selected');
      if (selected.length < 2) return;

      const membersGrid = document.getElementById('cg-members-grid');
      const countEl = document.getElementById('cg-info-count');
      if (membersGrid) {
        membersGrid.innerHTML = '';
        selected.forEach(item => {
          const img = item.querySelector('img');
          const nameEl = item.querySelector('.contact-name');
          const div = document.createElement('div');
          div.className = 'cg-member-item';
          div.innerHTML = '<img src="' + (img ? img.src : '') + '" alt="' + (nameEl ? nameEl.textContent : '') + '">'
            + '<span>' + (nameEl ? nameEl.textContent : '') + '</span>';
          membersGrid.appendChild(div);
        });
      }
      if (countEl) countEl.textContent = selected.length;

      var nameInput = document.getElementById('cg-name-input');
      if (nameInput) nameInput.value = '';
      var announceInput = document.getElementById('cg-announce-input');
      if (announceInput) announceInput.value = '';

      navigateTo('page-create-group-info', { direction: 'forward' });
      lucide.createIcons({ icons: lucide.icons });
    });

    var submitBtn = document.getElementById('create-group-submit');
    if (submitBtn) {
      submitBtn.addEventListener('click', function() {
        var nameInput = document.getElementById('cg-name-input');
        var groupName = nameInput ? nameInput.value.trim() : '';
        if (!groupName) {
          showToast('请输入群名称');
          return;
        }

        var selected = document.querySelectorAll('.group-contact-item.selected');
        var memberCount = selected.length + 1;

        showToast('群聊创建成功', 'success');

        var titleEl = document.querySelector('#page-group-chat .nav-title');
        if (titleEl) titleEl.textContent = groupName + '(' + memberCount + ')';

        var msgArea = document.getElementById('group-messages-area');
        if (msgArea) {
          var sysMsg = document.createElement('div');
          sysMsg.className = 'msg-system-admin';
          sysMsg.innerHTML = '<span class="msg-system-text">你 创建了群聊</span>';
          var firstChild = msgArea.firstChild;
          if (firstChild) {
            msgArea.insertBefore(sysMsg, firstChild);
          } else {
            msgArea.appendChild(sysMsg);
          }
        }

        var chatList = document.querySelector('#page-messages .chat-list');
        if (chatList) {
          var card = document.createElement('div');
          card.className = 'chat-card';
          card.dataset.chat = 'page-group-chat';
          card.innerHTML = '<div class="chat-avatar" style="width:48px;height:48px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;color:#fff;flex-shrink:0"><i data-lucide="users" style="width:24px;height:24px"></i></div>'
            + '<div class="chat-info">'
            + '<div class="chat-top"><span class="chat-name">' + groupName + '(' + memberCount + ')</span><span class="chat-time">刚刚</span></div>'
            + '<div class="chat-preview">你创建了群聊</div>'
            + '</div>';
          chatList.insertBefore(card, chatList.firstChild);
          card.addEventListener('click', function() {
            navigateTo('page-group-chat', { direction: 'forward' });
          });
          lucide.createIcons({ icons: lucide.icons });
        }

        items.forEach(item => item.classList.remove('selected'));
        updateSelection();

        navigateTo('page-group-chat', { direction: 'forward' });
      });
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
          if (action === 'redpacket' && window._setRpSourcePage) {
            window._setRpSourcePage(currentPage);
          }
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
              var safeText = escapeHtml(input.value);
              row.innerHTML = '<div class="bubble self-bubble">' + safeText + '</div><img class="msg-avatar" src="images/chat-me1.png" alt="我">';
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

      // 全局事件委托处理返回按钮（只匹配 .back-btn，排除 .page 容器）
      const backBtn = e.target.closest('.back-btn[data-back]');
      if (backBtn && !backBtn.classList.contains('page')) {
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
        var actions = acceptBtn.closest('.friend-req-actions');
        if (actions) {
          actions.innerHTML = '<span class="friend-req-done" style="color:#34C759;">已添加</span>';
        }
        return;
      }

      // 好友申请拒绝按钮
      var rejectBtn = e.target.closest('.friend-req-btn.reject');
      if (rejectBtn) {
        var actions = rejectBtn.closest('.friend-req-actions');
        if (actions) {
          actions.innerHTML = '<span class="friend-req-done" style="color:#FF3B30;">已拒绝</span>';
        }
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
        var _inp = document.getElementById('edit-name-input');
        var newName = _inp ? _inp.value.trim() : '';
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
        var _el1 = document.querySelector('#edit-gender-row .settings-value');
        var currentGender = (_el1 && _el1.childNodes[0]) ? _el1.childNodes[0].textContent.trim() : '';
        document.querySelectorAll('#page-edit-gender .select-option-item').forEach(function(item) {
          item.classList.toggle('selected', item.dataset.gender === currentGender);
        });
        navigateTo('page-edit-gender', { direction: 'forward' });
        return;
      }

      // 点击地区行 → 跳转修改地区页
      if (e.target.closest('#edit-region-row')) {
        var _el2 = document.querySelector('#edit-region-row .settings-value');
        var currentRegion = (_el2 && _el2.childNodes[0]) ? _el2.childNodes[0].textContent.trim() : '';
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
        var _el3 = document.querySelector('#edit-signature-row .settings-value');
        var currentSig = (_el3 && _el3.childNodes[0]) ? _el3.childNodes[0].textContent.trim() : '';
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
    var rpSourcePage = 'page-chat';

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

    window._setRpSourcePage = function(page) {
      rpSourcePage = page;
      var backBtn = document.querySelector('#page-send-redpacket .back-btn');
      if (backBtn) backBtn.setAttribute('data-back', page);
    };

    if (rpSubmit) {
      rpSubmit.addEventListener('click', function(e) {
        e.stopPropagation();
        var count = parseInt(rpCount ? rpCount.value : 1) || 0;
        var amount = parseFloat(rpAmount ? rpAmount.value : 0) || 0;
        if (amount <= 0) { alert('请输入金额'); return; }
        if (count <= 0) { alert('请输入红包个数'); return; }
        var typeText = currentRpType === 'lucky' ? '拼手气红包' : '普通红包';
        var wish = document.getElementById('rp-wish');
        var wishText = (wish && wish.value.trim()) || '恭喜发财，大吉大利';

        window._requirePayPwd(function() {
          var targetPage = document.getElementById(rpSourcePage);
          if (targetPage) {
            var msgArea = targetPage.querySelector('.messages-area');
            if (msgArea) {
              var isGroup = rpSourcePage === 'page-group-chat';
              var avatarSrc = isGroup ? 'images/group-me.png' : 'images/chat-me1.png';

              var row = document.createElement('div');
              row.className = 'message-row self';

              if (isGroup) {
                row.innerHTML =
                  '<div class="msg-content-group">' +
                    '<div class="sender-line"><span class="sender-name" data-sender="我">我</span><span class="vip-badge vip-lv8"><span class="vip-lvl">VIP8</span><span class="vip-icon">💎</span><span class="vip-text">至尊</span></span></div>' +
                    '<div class="red-packet-card">' +
                      '<div class="rp-icon">🧧</div>' +
                      '<div class="rp-info">' +
                        '<div class="rp-text">' + wishText + '</div>' +
                        '<div class="rp-label">' + typeText + '</div>' +
                      '</div>' +
                    '</div>' +
                  '</div>' +
                  '<img class="msg-avatar" src="' + avatarSrc + '" alt="我">';
              } else {
                row.innerHTML =
                  '<div class="red-packet-card">' +
                    '<div class="rp-icon">🧧</div>' +
                    '<div class="rp-info">' +
                      '<div class="rp-text">' + wishText + '</div>' +
                      '<div class="rp-label">' + typeText + '</div>' +
                    '</div>' +
                  '</div>' +
                  '<img class="msg-avatar" src="' + avatarSrc + '" alt="我">';
              }
              msgArea.appendChild(row);

              var statusRow = document.createElement('div');
              statusRow.className = 'msg-status-row';
              statusRow.innerHTML = '<span class="msg-status unread">✓ 已发送</span>';
              msgArea.appendChild(statusRow);

              msgArea.scrollTop = msgArea.scrollHeight;
            }
          }

          navigateTo(rpSourcePage, { direction: 'back' });
        });
      });
    }
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

      // 关闭按钮 / 返回聊天按钮
      if (e.target.closest('#rp-open-close') || e.target.closest('#rp-back-btn')) {
        navigateTo(rpLastChatPage, { direction: 'fade' });
        return;
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
    var atTaItem = document.getElementById('gm-at-ta');
    var selectedMsg = null;
    var longPressTimer = null;
    var longPressFired = false;
    var touchStartX = 0;
    var touchStartY = 0;

    function showGroupMsgMenu(x, y, msgEl) {
      if (!menu || !menuOverlay) return;
      selectedMsg = msgEl;
      window._groupMenuSelectedMsg = msgEl;
      var isOther = msgEl.classList.contains('other');
      if (atTaItem) {
        atTaItem.style.display = isOther ? '' : 'none';
      }
      var recallAllItem = document.getElementById('gm-recall-all');
      if (recallAllItem) {
        recallAllItem.style.display = isOther ? '' : 'none';
      }

      menu.classList.remove('show');
      menu.style.transition = 'none';
      menu.style.visibility = 'visible';
      menu.style.opacity = '0';
      menu.style.pointerEvents = 'none';
      menu.style.transform = 'scale(1)';
      menu.style.left = '0px';
      menu.style.top = '0px';
      var menuW = menu.offsetWidth;
      var menuH = menu.offsetHeight;

      var vw = window.innerWidth;
      var vh = window.innerHeight;
      var posX = Math.max(8, Math.min(x - menuW / 2, vw - menuW - 8));
      var posY = y - menuH - 12;
      if (posY < 8) posY = y + 12;
      if (posY + menuH > vh - 8) posY = vh - menuH - 8;

      menu.style.left = posX + 'px';
      menu.style.top = posY + 'px';
      menu.style.removeProperty('visibility');
      menu.style.removeProperty('opacity');
      menu.style.removeProperty('pointer-events');
      menu.style.removeProperty('transform');
      menu.style.removeProperty('transition');
      void menu.offsetWidth;
      menu.classList.add('show');
      menuOverlay.classList.add('show');

      if (typeof lucide !== 'undefined') lucide.createIcons();
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
        longPressFired = false;
        var touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        longPressTimer = setTimeout(function() {
          longPressFired = true;
          showGroupMsgMenu(touchStartX, touchStartY, msgRow);
        }, 500);
      }, { passive: true });

      groupChatBody.addEventListener('touchend', function(e) {
        if (longPressFired) {
          e.preventDefault();
        }
        if (!longPressFired) {
          clearTimeout(longPressTimer);
        }
        longPressTimer = null;
      }, { passive: false });

      groupChatBody.addEventListener('touchmove', function(e) {
        if (!longPressFired && longPressTimer) {
          var touch = e.touches[0];
          var dx = touch.clientX - touchStartX;
          var dy = touch.clientY - touchStartY;
          if (dx * dx + dy * dy > 100) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
          }
        }
      }, { passive: true });

      groupChatBody.addEventListener('contextmenu', function(e) {
        var msgRow = e.target.closest('.message-row');
        if (!msgRow) return;
        e.preventDefault();
        showGroupMsgMenu(e.clientX, e.clientY, msgRow);
      });
    }

    if (menu) menu.addEventListener('click', function(e) {
      var item = e.target.closest('.group-msg-menu-item');
      if (!item) return;

      if (item.id === 'gm-at-ta') {
        if (selectedMsg) {
          var senderEl = selectedMsg.querySelector('.sender-name');
          var senderName = senderEl ? (senderEl.getAttribute('data-sender') || senderEl.textContent.trim()) : '';
          if (senderName) {
            var input = document.getElementById('group-chat-input');
            if (input) {
              var current = input.value;
              var mention = '@' + senderName + ' ';
              input.value = current + mention;
              input.focus();
              input.setSelectionRange(input.value.length, input.value.length);
            }
          }
        }
        hideGroupMsgMenu();
        return;
      }
      if (item.id === 'gm-recall') {
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
      if (item.id === 'gm-mute') {
        var senderEl2 = selectedMsg ? selectedMsg.querySelector('.sender-name') : null;
        var name = senderEl2 ? senderEl2.textContent : '该成员';
        alert('已对 ' + name + ' 禁言');
        hideGroupMsgMenu();
        return;
      }
      if (item.id === 'gm-copy') {
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
      if (item.id === 'gm-forward') {
        if (selectedMsg) {
          var bubble = selectedMsg.querySelector('.bubble');
          if (bubble) {
            showForwardSheet(bubble.textContent);
          }
        }
        hideGroupMsgMenu();
        return;
      }
      if (item.id === 'gm-delete') {
        if (selectedMsg) {
          var target = selectedMsg;
          target.style.transition = 'opacity 0.3s, max-height 0.3s';
          target.style.opacity = '0';
          target.style.maxHeight = '0';
          target.style.overflow = 'hidden';
          setTimeout(function() { if (target) target.style.display = 'none'; }, 300);
        }
        hideGroupMsgMenu();
        return;
      }
      if (item.id === 'gm-reply') {
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
          var tx = e.touches[0].clientX;
          var ty = e.touches[0].clientY;
          chatLongPressTimer = setTimeout(function() {
            showChatMsgMenu(tx, ty, msgRow);
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

        if (action === 'forward') {
          var bubble = chatMenuTarget.querySelector('.bubble');
          if (bubble) {
            showForwardSheet(bubble.textContent);
          }
          hideChatMenu();
          return;
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
    var app = document.getElementById('app');
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

  // =============================================
  //  弹窗定位：对齐 app-container
  // =============================================
  function alignSheetToApp(sheetEl) {
    if (!sheetEl) return;
    var appContainer = document.getElementById('app');
    if (appContainer) {
      var rect = appContainer.getBoundingClientRect();
      sheetEl.style.left = rect.left + 'px';
      sheetEl.style.width = rect.width + 'px';
      sheetEl.style.maxWidth = rect.width + 'px';
    }
  }
  window._alignSheetToApp = alignSheetToApp;

  // =============================================
  //  Toast 提示
  // =============================================
  var toastTimer = null;
  window.showToast = function(msg, type) {
    var el = document.getElementById('app-toast');
    if (!el) return;
    clearTimeout(toastTimer);
    el.textContent = msg;
    el.className = 'app-toast' + (type === 'success' ? ' success' : '');
    void el.offsetWidth;
    el.classList.add('show');
    toastTimer = setTimeout(function() {
      el.classList.remove('show');
    }, 1800);
  };

  // =============================================
  //  群发弹窗
  // =============================================
  (function() {
    var overlay = document.getElementById('mass-send-overlay');
    var sheet = document.getElementById('mass-send-sheet');
    var input = document.getElementById('mass-send-input');
    var confirmBtn = document.getElementById('mass-send-confirm');
    var cancelBtn = document.getElementById('mass-send-cancel');
    var friendsList = document.getElementById('mass-friends-list');
    var groupsList = document.getElementById('mass-groups-list');
    var countEl = document.getElementById('mass-selected-count');

    function open() {
      if (!sheet || !overlay) return;
      if (input) input.value = '';
      sheet.querySelectorAll('.mass-check, .mass-select-all input').forEach(function(cb) { cb.checked = false; });
      updateCount();
      sheet.querySelectorAll('.mass-send-tab').forEach(function(t) { t.classList.remove('active'); });
      var firstTab = sheet.querySelector('.mass-send-tab[data-mass-tab="friends"]');
      if (firstTab) firstTab.classList.add('active');
      if (friendsList) friendsList.style.display = '';
      if (groupsList) groupsList.style.display = 'none';

      if (window._alignSheetToApp) window._alignSheetToApp(sheet);
      overlay.classList.add('show');
      requestAnimationFrame(function() {
        sheet.classList.add('show');
      });
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    function close() {
      if (!sheet || !overlay) return;
      sheet.classList.remove('show');
      setTimeout(function() {
        overlay.classList.remove('show');
      }, 350);
    }

    function updateCount() {
      var checked = sheet ? sheet.querySelectorAll('.mass-check:checked').length : 0;
      if (countEl) countEl.textContent = '已选择 ' + checked + ' 人';
    }

    window.showMassSendSheet = open;

    if (overlay) overlay.addEventListener('click', close);
    if (cancelBtn) cancelBtn.addEventListener('click', close);

    if (sheet) {
      sheet.querySelectorAll('.mass-send-tab').forEach(function(tab) {
        tab.addEventListener('click', function() {
          sheet.querySelectorAll('.mass-send-tab').forEach(function(t) { t.classList.remove('active'); });
          tab.classList.add('active');
          var tabType = tab.getAttribute('data-mass-tab');
          if (friendsList) friendsList.style.display = tabType === 'friends' ? '' : 'none';
          if (groupsList) groupsList.style.display = tabType === 'groups' ? '' : 'none';
        });
      });

      sheet.addEventListener('change', function(e) {
        if (e.target.id === 'mass-friends-all') {
          friendsList.querySelectorAll('.mass-check').forEach(function(cb) { cb.checked = e.target.checked; });
        }
        if (e.target.id === 'mass-groups-all') {
          groupsList.querySelectorAll('.mass-check').forEach(function(cb) { cb.checked = e.target.checked; });
        }
        if (e.target.classList.contains('mass-check')) {
          var list = e.target.closest('.mass-send-list');
          var allCheck = list ? list.querySelector('.mass-select-all input') : null;
          if (allCheck) {
            var all = list.querySelectorAll('.mass-check');
            var checked = list.querySelectorAll('.mass-check:checked');
            allCheck.checked = all.length === checked.length;
          }
        }
        updateCount();
      });

      sheet.addEventListener('click', function(e) {
        var item = e.target.closest('.mass-contact-item');
        if (item && !e.target.classList.contains('mass-check')) {
          var cb = item.querySelector('.mass-check');
          if (cb) {
            cb.checked = !cb.checked;
            cb.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }
      });
    }

    if (confirmBtn) {
      confirmBtn.addEventListener('click', function() {
        var text = input ? input.value.trim() : '';
        if (!text) {
          showToast('请输入消息内容');
          return;
        }
        var checked = sheet.querySelectorAll('.mass-check:checked');
        if (checked.length === 0) {
          showToast('请选择发送对象');
          return;
        }
        var names = [];
        checked.forEach(function(cb) { names.push(cb.getAttribute('data-name')); });
        close();
        setTimeout(function() {
          showToast('已群发给 ' + names.length + ' 人', 'success');
        }, 400);
      });
    }
  })();

  // =============================================
  //  转发弹窗
  // =============================================
  (function() {
    var overlay = document.getElementById('forward-overlay');
    var sheet = document.getElementById('forward-sheet');
    var preview = document.getElementById('forward-preview');
    var confirmBtn = document.getElementById('forward-confirm');
    var cancelBtn = document.getElementById('forward-cancel');

    function open(msgText) {
      if (!sheet || !overlay) return;
      if (preview) {
        preview.textContent = msgText || '';
      }
      if (window._alignSheetToApp) window._alignSheetToApp(sheet);
      overlay.classList.add('show');
      requestAnimationFrame(function() {
        sheet.classList.add('show');
      });
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    function close() {
      if (!sheet || !overlay) return;
      sheet.classList.remove('show');
      setTimeout(function() {
        overlay.classList.remove('show');
      }, 350);
    }

    window.showForwardSheet = open;

    if (overlay) overlay.addEventListener('click', close);
    if (cancelBtn) cancelBtn.addEventListener('click', close);

    if (sheet) {
      sheet.querySelectorAll('.target-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
          sheet.querySelectorAll('.target-btn').forEach(function(b) { b.classList.remove('active'); });
          btn.classList.add('active');
        });
      });
    }

    if (confirmBtn) {
      confirmBtn.addEventListener('click', function() {
        close();
        setTimeout(function() {
          showToast('转发成功', 'success');
        }, 400);
      });
    }
  })();

  // =============================================
  // ==================== 通用确认弹窗管理 ====================
  (function() {
    var overlay = document.getElementById('recall-confirm-overlay');
    var titleEl = overlay ? overlay.querySelector('.recall-confirm-title') : null;
    var msgEl = document.getElementById('recall-confirm-msg');
    var okBtn = document.getElementById('recall-confirm-ok');
    var cancelBtn = document.getElementById('recall-confirm-cancel');
    var _pendingCallback = null;

    function showConfirmDialog(opts) {
      if (!overlay) return;
      if (titleEl) titleEl.textContent = opts.title || '确认操作';
      if (msgEl) msgEl.textContent = opts.message || '确认执行此操作？';
      if (okBtn) okBtn.textContent = opts.okText || '确认';
      _pendingCallback = opts.onConfirm || null;
      overlay.classList.add('show');
    }

    function hideConfirmDialog() {
      if (overlay) overlay.classList.remove('show');
      _pendingCallback = null;
    }

    if (okBtn) okBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      if (_pendingCallback) _pendingCallback();
      hideConfirmDialog();
    });
    if (cancelBtn) cancelBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      hideConfirmDialog();
    });
    if (overlay) overlay.addEventListener('click', function(e) {
      if (e.target === overlay) hideConfirmDialog();
    });

    window._showConfirmDialog = showConfirmDialog;
  })();

  //  36. 一键撤回指定成员所有消息
  // =============================================
  (function() {
    function doRecallAndKick(memberName) {
      var msgArea = document.getElementById('group-messages-area');
      if (!msgArea) return;
      var rows = msgArea.querySelectorAll('.message-row.other');
      var removedCount = 0;
      rows.forEach(function(row) {
        var senderEl = row.querySelector('.sender-name');
        if (senderEl) {
          var sender = senderEl.getAttribute('data-sender') || senderEl.textContent.trim();
          if (sender === memberName) {
            var next = row.nextElementSibling;
            if (next && next.classList.contains('msg-status-row')) next.remove();
            row.style.transition = 'opacity 0.3s, max-height 0.3s';
            row.style.opacity = '0';
            row.style.maxHeight = '0';
            row.style.overflow = 'hidden';
            setTimeout(function() { row.remove(); }, 300);
            removedCount++;
          }
        }
      });
      var sysMsg = document.createElement('div');
      sysMsg.className = 'system-msg';
      sysMsg.textContent = '"' + memberName + '" 已被管理员移出群聊，其 ' + removedCount + ' 条消息已撤回';
      msgArea.appendChild(sysMsg);
      msgArea.scrollTop = msgArea.scrollHeight;
      if (typeof showToast === 'function') {
        showToast(memberName + ' 已被踢出群聊，撤回 ' + removedCount + ' 条消息', 'success');
      }
    }

    function showRecallConfirm(memberName) {
      window._showConfirmDialog({
        title: '撤回TA所有消息并踢出',
        message: '确认撤回 "' + memberName + '" 的所有消息并将其踢出群组？此操作不可恢复。',
        okText: '确认执行',
        onConfirm: function() { doRecallAndKick(memberName); }
      });
    }

    var gmRecallAll = document.getElementById('gm-recall-all');
    if (gmRecallAll) {
      gmRecallAll.addEventListener('click', function() {
        var menuEl = document.getElementById('group-msg-menu');
        if (window._groupMenuSelectedMsg) {
          var senderEl = window._groupMenuSelectedMsg.querySelector('.sender-name');
          if (senderEl) {
            var name = senderEl.getAttribute('data-sender') || senderEl.textContent.trim();
            var gmOverlay = document.getElementById('group-msg-menu-overlay');
            if (menuEl) menuEl.classList.remove('show');
            if (gmOverlay) gmOverlay.classList.remove('show');
            showRecallConfirm(name);
          }
        }
      });
    }

    document.getElementById('app').addEventListener('click', function(e) {
      var btn = e.target.closest('.admin-recall-all-btn');
      if (btn) {
        var memberName = btn.getAttribute('data-member');
        if (memberName) showRecallConfirm(memberName);
      }
    });
  })();

  // ==================== 聊天记录管理 ====================
  (function() {
    var app = document.getElementById('app');

    var chatManageEntry = document.getElementById('menu-chat-manage');
    if (chatManageEntry) chatManageEntry.addEventListener('click', function() { navigateTo('page-chat-manage', { direction: 'forward' }); });

    var allCheck = document.getElementById('chat-manage-all-check');
    var deleteBtn = document.getElementById('chat-manage-delete-btn');
    var clearAllBtn = document.getElementById('chat-manage-clear-all-btn');

    function getItemChecks() {
      return document.querySelectorAll('#page-chat-manage .chat-manage-item-check');
    }

    function updateCount() {
      var checks = getItemChecks();
      var checked = 0;
      checks.forEach(function(c) { if (c.checked) checked++; });
      var countEl = document.querySelector('#page-chat-manage .chat-manage-selected-count');
      if (countEl) countEl.textContent = '已选择 ' + checked + ' 项';
      if (deleteBtn) deleteBtn.disabled = (checked === 0);
      if (allCheck) allCheck.checked = (checked === checks.length && checks.length > 0);
      checks.forEach(function(c) {
        var item = c.closest('.chat-manage-item');
        if (item) {
          if (c.checked) item.classList.add('selected');
          else item.classList.remove('selected');
        }
      });
    }

    if (allCheck) {
      allCheck.addEventListener('change', function() {
        var checks = getItemChecks();
        checks.forEach(function(c) { c.checked = allCheck.checked; });
        updateCount();
      });
    }

    app.addEventListener('click', function(e) {
      var item = e.target.closest('.chat-manage-item');
      if (item && !e.target.closest('.chat-manage-check')) {
        var check = item.querySelector('.chat-manage-item-check');
        if (check) {
          check.checked = !check.checked;
          updateCount();
        }
      }
    });

    app.addEventListener('change', function(e) {
      if (e.target.classList.contains('chat-manage-item-check')) {
        updateCount();
      }
    });

    if (deleteBtn) {
      deleteBtn.addEventListener('click', function() {
        var checks = getItemChecks();
        var selected = [];
        checks.forEach(function(c) { if (c.checked) selected.push(c); });
        if (selected.length === 0) return;
        var count = selected.length;

        window._showConfirmDialog({
          title: '删除聊天记录',
          message: '确认删除选中的 ' + count + ' 个聊天记录？删除后将无法恢复。',
          okText: '确认删除',
          onConfirm: function() {
            selected.forEach(function(c) {
              var item = c.closest('.chat-manage-item');
              if (item) {
                item.classList.add('removing');
                setTimeout(function() { item.remove(); updateCount(); }, 350);
              }
            });
            if (typeof showToast === 'function') showToast('已删除 ' + count + ' 个聊天记录', 'success');
          }
        });
      });
    }

    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', function() {
        window._showConfirmDialog({
          title: '清空所有聊天记录',
          message: '确认清空所有聊天记录？清空后将无法恢复。',
          okText: '确认清空',
          onConfirm: function() {
            var items = document.querySelectorAll('#page-chat-manage .chat-manage-item');
            items.forEach(function(item) { item.classList.add('removing'); });
            setTimeout(function() {
              items.forEach(function(item) { item.remove(); });
              updateCount();
            }, 350);
            if (typeof showToast === 'function') showToast('已清空所有聊天记录', 'success');
          }
        });
      });
    }
  })();

  // =============================================
  //  账号与安全
  // =============================================
  (function() {
    var securityEntry = document.getElementById('menu-account-security');
    if (securityEntry) securityEntry.addEventListener('click', function() { navigateTo('page-account-security', { direction: 'forward' }); });

    var changePwd = document.getElementById('security-change-pwd');
    var changePhone = document.getElementById('security-change-phone');
    if (changePwd) changePwd.addEventListener('click', function() { navigateTo('page-change-password', { direction: 'forward' }); });
    if (changePhone) changePhone.addEventListener('click', function() { navigateTo('page-change-phone', { direction: 'forward' }); });

    var deleteAccount = document.getElementById('security-delete-account');
    if (deleteAccount) deleteAccount.addEventListener('click', function() {
      window._showConfirmDialog({
        title: '注销账号',
        message: '注销后账号将无法恢复，所有数据将被清除。确认注销？',
        okText: '确认注销',
        onConfirm: function() { showToast('账号已注销', 'success'); }
      });
    });

    document.querySelectorAll('.pwd-tab').forEach(function(tab) {
      tab.addEventListener('click', function() {
        var container = tab.closest('.page');
        if (!container) return;
        container.querySelectorAll('.pwd-tab').forEach(function(t) { t.classList.remove('active'); });
        container.querySelectorAll('.pwd-panel').forEach(function(p) { p.classList.remove('active'); });
        tab.classList.add('active');
        var panel = document.getElementById('pwd-panel-' + tab.getAttribute('data-pwd-tab'));
        if (panel) panel.classList.add('active');
      });
    });

    function startCountdown(btn) {
      var seconds = 60;
      btn.disabled = true;
      btn.textContent = seconds + 's';
      var timer = setInterval(function() {
        seconds--;
        btn.textContent = seconds + 's';
        if (seconds <= 0) {
          clearInterval(timer);
          btn.disabled = false;
          btn.textContent = '发送验证码';
        }
      }, 1000);
    }

    ['pwd-send-code', 'phone-old-send', 'phone-new-send', 'login-send-code', 'pay-send-code'].forEach(function(id) {
      var btn = document.getElementById(id);
      if (btn) btn.addEventListener('click', function() {
        startCountdown(btn);
        showToast('验证码已发送', 'success');
      });
    });

    // 修改密码类型选择导航
    document.addEventListener('click', function(e) {
      if (e.target.closest('#go-change-login-pwd')) {
        navigateTo('page-change-login-pwd', { direction: 'forward' });
      }
      if (e.target.closest('#go-change-pay-pwd')) {
        navigateTo('page-change-pay-pwd', { direction: 'forward' });
      }
    });

    // 登录密码 — 旧密码方式
    var submitLoginOld = document.getElementById('submit-login-pwd-old');
    if (submitLoginOld) submitLoginOld.addEventListener('click', function() {
      var old = document.getElementById('login-old-pwd').value.trim();
      var n1 = document.getElementById('login-new-pwd').value.trim();
      var n2 = document.getElementById('login-confirm-pwd').value.trim();
      if (!old) { showToast('请输入旧密码'); return; }
      if (!n1) { showToast('请输入新密码'); return; }
      if (n1.length < 6) { showToast('密码至少6位'); return; }
      if (n1 !== n2) { showToast('两次密码不一致'); return; }
      showToast('登录密码修改成功', 'success');
      navigateTo('page-change-password', { direction: 'back' });
    });

    // 登录密码 — 验证码方式
    var submitLoginCode = document.getElementById('submit-login-pwd-code');
    if (submitLoginCode) submitLoginCode.addEventListener('click', function() {
      var code = document.getElementById('login-code-input').value.trim();
      var n1 = document.getElementById('login-code-new-pwd').value.trim();
      var n2 = document.getElementById('login-code-confirm-pwd').value.trim();
      if (!code) { showToast('请输入验证码'); return; }
      if (!n1) { showToast('请输入新密码'); return; }
      if (n1.length < 6) { showToast('密码至少6位'); return; }
      if (n1 !== n2) { showToast('两次密码不一致'); return; }
      showToast('登录密码修改成功', 'success');
      navigateTo('page-change-password', { direction: 'back' });
    });

    // 支付密码 — 旧密码方式
    var submitPayOld = document.getElementById('submit-pay-pwd-old');
    if (submitPayOld) submitPayOld.addEventListener('click', function() {
      var old = document.getElementById('pay-old-pwd').value.trim();
      var n1 = document.getElementById('pay-new-pwd').value.trim();
      var n2 = document.getElementById('pay-confirm-pwd').value.trim();
      if (!old || old.length !== 6) { showToast('请输入6位当前支付密码'); return; }
      if (!n1 || n1.length !== 6) { showToast('请输入6位新支付密码'); return; }
      if (n1 !== n2) { showToast('两次输入不一致'); return; }
      showToast('支付密码修改成功', 'success');
      navigateTo('page-change-password', { direction: 'back' });
    });

    // 支付密码 — 验证码方式
    var submitPayCode = document.getElementById('submit-pay-pwd-code');
    if (submitPayCode) submitPayCode.addEventListener('click', function() {
      var code = document.getElementById('pay-code-input').value.trim();
      var n1 = document.getElementById('pay-code-new-pwd').value.trim();
      var n2 = document.getElementById('pay-code-confirm-pwd').value.trim();
      if (!code) { showToast('请输入验证码'); return; }
      if (!n1 || n1.length !== 6) { showToast('请输入6位新支付密码'); return; }
      if (n1 !== n2) { showToast('两次输入不一致'); return; }
      showToast('支付密码修改成功', 'success');
      navigateTo('page-change-password', { direction: 'back' });
    });

    var phoneNext = document.getElementById('phone-step-next');
    if (phoneNext) phoneNext.addEventListener('click', function() {
      var code = document.getElementById('phone-old-code').value.trim();
      if (!code) { showToast('请输入验证码'); return; }
      var phoneStep1 = document.getElementById('phone-step-1');
      var phoneStep2 = document.getElementById('phone-step-2');
      if (phoneStep1) phoneStep1.classList.remove('active');
      if (phoneStep2) phoneStep2.classList.add('active');
    });

    var phoneBind = document.getElementById('phone-bind-submit');
    if (phoneBind) phoneBind.addEventListener('click', function() {
      var phone = document.getElementById('phone-new-number').value.trim();
      var code = document.getElementById('phone-new-code').value.trim();
      if (!phone || phone.length !== 11) { showToast('请输入正确的手机号'); return; }
      if (!code) { showToast('请输入验证码'); return; }
      var masked = phone.substring(0, 3) + '****' + phone.substring(7);
      var secVal = document.querySelector('#security-change-phone .security-value');
      if (secVal) secVal.innerHTML = masked + ' <i data-lucide="chevron-right"></i>';
      if (typeof lucide !== 'undefined') lucide.createIcons();
      showToast('手机号绑定成功', 'success');
      navigateTo('page-account-security', { direction: 'back' });
    });
  })();

  /* ============================== */
  /*  群签到活动                     */
  /* ============================== */
  (function() {
    var checkinDone = false;
    var totalScore = 62;
    window._checkinScore = totalScore;
    var streakDays = 3;
    var checkedDates = [3, 4, 5, 6];

    function renderCalendar() {
      var grid = document.getElementById('checkin-cal-grid');
      var monthLabel = document.getElementById('checkin-cal-month');
      if (!grid) return;

      var now = new Date();
      var year = now.getFullYear();
      var month = now.getMonth();
      var today = now.getDate();

      if (monthLabel) monthLabel.textContent = year + '年' + (month + 1) + '月';

      var firstDay = new Date(year, month, 1).getDay();
      var startOffset = firstDay === 0 ? 6 : firstDay - 1;
      var daysInMonth = new Date(year, month + 1, 0).getDate();

      grid.innerHTML = '';
      for (var i = 0; i < startOffset; i++) {
        var empty = document.createElement('div');
        empty.className = 'checkin-cal-day empty';
        grid.appendChild(empty);
      }
      for (var d = 1; d <= daysInMonth; d++) {
        var dayEl = document.createElement('div');
        dayEl.className = 'checkin-cal-day';
        dayEl.setAttribute('data-date', d);
        if (d === today) dayEl.classList.add('today');
        if (d > today) dayEl.classList.add('future');
        if (checkedDates.indexOf(d) !== -1) dayEl.classList.add('checked');
        dayEl.innerHTML = '<span class="cal-day-num">' + d + '</span>';
        grid.appendChild(dayEl);
      }
    }

    function updateMilestones() {
      var items = document.querySelectorAll('.checkin-ms-item');
      items.forEach(function(item) {
        var days = parseInt(item.getAttribute('data-days'));
        var statusEl = item.querySelector('.checkin-ms-status');
        if (streakDays >= days) {
          item.classList.add('achieved');
          if (statusEl) statusEl.textContent = '✓ 已达成';
        } else {
          item.classList.remove('achieved');
          if (statusEl) statusEl.textContent = '还差 ' + (days - streakDays) + ' 天';
        }
      });
    }

    function updateDisplay() {
      var scoreEl = document.getElementById('checkin-total-score');
      if (scoreEl) scoreEl.textContent = totalScore;
      var streakEl = document.getElementById('checkin-streak-num');
      if (streakEl) streakEl.textContent = streakDays;
      var oldScore = document.getElementById('checkin-score');
      if (oldScore) oldScore.textContent = totalScore;
      var oldStreak = document.getElementById('checkin-streak-days');
      if (oldStreak) oldStreak.textContent = streakDays;
      updateMilestones();
    }

    function doCheckin() {
      if (checkinDone) return;
      checkinDone = true;

      var basePoints = 10 + Math.floor(Math.random() * 11);
      var bonusPoints = 0;
      streakDays++;

      if (streakDays === 3) bonusPoints += 5;
      if (streakDays === 7) bonusPoints += 20;
      if (streakDays === 15) bonusPoints += 50;
      if (streakDays === 30) bonusPoints += 100;

      var earnedPoints = basePoints + bonusPoints;
      totalScore += earnedPoints;
      window._checkinScore = totalScore;

      var today = new Date().getDate();
      if (checkedDates.indexOf(today) === -1) checkedDates.push(today);

      var todayEl = document.querySelector('.checkin-cal-day.today');
      if (todayEl) todayEl.classList.add('checked');

      var btns = [
        document.getElementById('checkin-btn'),
        document.getElementById('checkin-big-btn'),
        document.getElementById('checkin-hero-btn')
      ];
      btns.forEach(function(btn) {
        if (btn) {
          btn.textContent = '今日已签到 ✓';
          btn.classList.add('checked');
          btn.disabled = true;
        }
      });

      updateDisplay();

      var msgArea = document.getElementById('group-messages-area');
      if (msgArea) {
        var nickEl = document.querySelector('.profile-name');
        var nickname = nickEl ? nickEl.textContent.trim() : '小明';
        var row = document.createElement('div');
        row.className = 'message-row system';
        var bonusText = bonusPoints > 0 ? '（含连续签到奖励 +' + bonusPoints + '）' : '';
        row.innerHTML = '<div class="checkin-redpacket-card">' +
          '<div class="checkin-rp-icon">🎁</div>' +
          '<div class="checkin-rp-info">' +
          '<div class="checkin-rp-name">' + nickname + ' 签到成功</div>' +
          '<div class="checkin-rp-points">+' + earnedPoints + ' 积分 ' + bonusText + '</div>' +
          '</div>' +
          '<div class="checkin-rp-arrow"><i data-lucide="chevron-right"></i></div>' +
          '</div>';
        msgArea.appendChild(row);
        msgArea.scrollTop = msgArea.scrollHeight;

        row.querySelector('.checkin-redpacket-card').addEventListener('click', function() {
          navigateTo('page-group-checkin', { direction: 'forward' });
        });

        if (typeof lucide !== 'undefined') lucide.createIcons();
      }

      var historyList = document.getElementById('checkin-history-list');
      if (historyList) {
        var now = new Date();
        var dateStr = (now.getMonth() + 1) + '月' + now.getDate() + '日';
        var newItem = document.createElement('div');
        newItem.className = 'checkin-history-item checkin-new';
        newItem.innerHTML = '<span class="checkin-h-date">' + dateStr + '</span>' +
          '<span class="checkin-h-desc">每日签到</span>' +
          '<span class="checkin-h-points">+' + earnedPoints + ' 积分</span>';
        historyList.insertBefore(newItem, historyList.firstChild);

        if (bonusPoints > 0) {
          var bonusItem = document.createElement('div');
          bonusItem.className = 'checkin-history-item checkin-new';
          bonusItem.innerHTML = '<span class="checkin-h-date">' + dateStr + '</span>' +
            '<span class="checkin-h-desc">连续签到' + streakDays + '天奖励</span>' +
            '<span class="checkin-h-points">+' + bonusPoints + ' 积分</span>';
          historyList.insertBefore(bonusItem, historyList.firstChild);
        }
      }

      var membersList = document.getElementById('checkin-members-list');
      if (membersList) {
        var myNick = document.querySelector('.profile-name');
        var myName = myNick ? myNick.textContent.trim() : '小明';
        var now2 = new Date();
        var timeStr = String(now2.getHours()).padStart(2,'0') + ':' + String(now2.getMinutes()).padStart(2,'0');
        var newMember = document.createElement('div');
        newMember.className = 'checkin-member-item checkin-new';
        newMember.innerHTML = '<img class="checkin-member-avatar" src="https://i.pravatar.cc/100?img=3" alt="">' +
          '<span class="checkin-member-name">' + myName + '</span>' +
          '<span class="checkin-member-time">' + timeStr + '</span>' +
          '<span class="checkin-member-score">+' + earnedPoints + '</span>';
        membersList.insertBefore(newMember, membersList.firstChild);
      }

      var toastMsg = '签到成功！+' + earnedPoints + ' 积分';
      if (bonusPoints > 0) toastMsg += '（含连签奖励 +' + bonusPoints + '）';
      showToast(toastMsg, 'success');
    }

    var checkinBtn = document.getElementById('checkin-btn');
    var checkinBigBtn = document.getElementById('checkin-big-btn');
    var checkinHeroBtn = document.getElementById('checkin-hero-btn');

    if (checkinBtn) checkinBtn.addEventListener('click', function(e) { e.stopPropagation(); doCheckin(); });
    if (checkinBigBtn) checkinBigBtn.addEventListener('click', doCheckin);
    if (checkinHeroBtn) checkinHeroBtn.addEventListener('click', doCheckin);

    var checkinBar = document.getElementById('group-checkin-bar');
    if (checkinBar) checkinBar.addEventListener('click', function(e) {
      if (e.target.closest('.checkin-bar-btn')) return;
      navigateTo('page-group-checkin', { direction: 'forward' });
    });

    renderCalendar();
    updateDisplay();
  })();

  /* ============================== */
  /*  积分兑换                       */
  /* ============================== */
  (function() {
    function getScore() {
      return window._checkinScore || 62;
    }
    function setScore(val) {
      window._checkinScore = val;
      var el1 = document.getElementById('checkin-total-score');
      if (el1) el1.textContent = val;
      var el2 = document.getElementById('checkin-score');
      if (el2) el2.textContent = val;
    }

    var input = document.getElementById('points-exchange-input');
    var currentEl = document.getElementById('points-current');
    var previewPoints = document.getElementById('points-preview-points');
    var previewAmount = document.getElementById('points-preview-amount');
    var previewRemain = document.getElementById('points-preview-remain');
    var exchangeBtn = document.getElementById('points-exchange-btn');
    var walletBalance = document.getElementById('wallet-points-balance');

    function updatePreview() {
      var score = getScore();
      var val = parseInt(input ? input.value : 0) || 0;
      if (val < 0) val = 0;
      if (val > score) val = score;
      var amount = Math.floor(val / 10);
      var actualPoints = amount * 10;

      if (previewPoints) previewPoints.textContent = actualPoints + ' 积分';
      if (previewAmount) previewAmount.textContent = '¥ ' + amount.toFixed(2);
      if (previewRemain) previewRemain.textContent = (score - actualPoints) + ' 积分';
      if (exchangeBtn) exchangeBtn.disabled = (actualPoints <= 0);
    }

    if (input) input.addEventListener('input', updatePreview);

    document.getElementById('app').addEventListener('click', function(e) {
      var qbtn = e.target.closest('.points-quick-btn');
      if (qbtn && input) {
        var pts = qbtn.getAttribute('data-points');
        if (pts === 'all') {
          var score = getScore();
          input.value = Math.floor(score / 10) * 10;
        } else {
          input.value = pts;
        }
        document.querySelectorAll('.points-quick-btn').forEach(function(b) { b.classList.remove('active'); });
        qbtn.classList.add('active');
        updatePreview();
      }
    });

    if (exchangeBtn) exchangeBtn.addEventListener('click', function() {
      var score = getScore();
      var val = parseInt(input.value) || 0;
      var amount = Math.floor(val / 10);
      var actualPoints = amount * 10;
      if (actualPoints <= 0 || actualPoints > score) {
        showToast('积分不足或输入无效'); return;
      }

      window._showConfirmDialog({
        title: '确认兑换',
        message: '确认将 ' + actualPoints + ' 积分兑换为 ¥' + amount.toFixed(2) + '？兑换后不可撤销。',
        okText: '确认兑换',
        onConfirm: function() {
          var newScore = score - actualPoints;
          setScore(newScore);

          if (currentEl) currentEl.textContent = newScore;
          if (walletBalance) walletBalance.textContent = newScore + ' 积分';
          if (input) input.value = '';
          updatePreview();

          var historyList = document.getElementById('points-history-list');
          if (historyList) {
            var emptyEl = historyList.querySelector('.points-history-empty');
            if (emptyEl) emptyEl.remove();

            var now = new Date();
            var dateStr = (now.getMonth()+1) + '月' + now.getDate() + '日 ' +
              String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0');
            var item = document.createElement('div');
            item.className = 'points-history-item';
            item.innerHTML = '<span class="points-h-date">' + dateStr + '</span>' +
              '<span class="points-h-amount">¥' + amount.toFixed(2) + '</span>' +
              '<span class="points-h-points">-' + actualPoints + '积分</span>';
            historyList.insertBefore(item, historyList.firstChild);
          }

          showToast('兑换成功！¥' + amount.toFixed(2) + ' 已到账', 'success');
        }
      });
    });

    var entry = document.getElementById('wallet-points-entry');
    if (entry) entry.addEventListener('click', function() {
      var score = getScore();
      if (currentEl) currentEl.textContent = score;
      if (walletBalance) walletBalance.textContent = score + ' 积分';
      updatePreview();
      navigateTo('page-points-exchange', { direction: 'forward' });
    });
  })();

  // 发言领积分活动
  (function() {
    var speakCount = 0;
    var speakPoints = 0;
    var tiers = [
      { count: 20, reward: 10 },
      { count: 50, reward: 20 },
      { count: 100, reward: 50 },
      { count: 200, reward: 100 },
      { count: 500, reward: 200 }
    ];
    var claimedTiers = [];

    function updateSpeakDisplay() {
      var countEl = document.getElementById('speak-today-count');
      var pointsEl = document.getElementById('speak-today-points');
      var progressFill = document.getElementById('speak-progress-fill');
      var nextTarget = document.getElementById('speak-next-target');

      if (countEl) countEl.textContent = speakCount;
      if (pointsEl) pointsEl.textContent = speakPoints;

      var nextTier = null;
      var nextIdx = -1;
      for (var i = 0; i < tiers.length; i++) {
        if (speakCount < tiers[i].count) { nextTier = tiers[i]; nextIdx = i; break; }
      }

      if (progressFill) {
        if (nextTier) {
          var prevCount = (nextIdx > 0) ? tiers[nextIdx - 1].count : 0;
          var pct = ((speakCount - prevCount) / (nextTier.count - prevCount)) * 100;
          progressFill.style.width = Math.min(pct, 100) + '%';
        } else {
          progressFill.style.width = '100%';
        }
      }
      if (nextTarget) {
        nextTarget.textContent = nextTier ? (nextTier.count + '条') : '已全部达成！';
      }

      tiers.forEach(function(t) {
        var btn = document.getElementById('speak-tier-' + t.count);
        if (!btn) return;
        if (claimedTiers.indexOf(t.count) !== -1) {
          btn.textContent = '已领取 ✓';
          btn.className = 'speak-tier-btn claimed';
          btn.disabled = true;
        } else if (speakCount >= t.count) {
          btn.textContent = '领取';
          btn.className = 'speak-tier-btn claimable';
          btn.disabled = false;
        } else {
          btn.textContent = '还差 ' + (t.count - speakCount) + ' 条';
          btn.className = 'speak-tier-btn';
          btn.disabled = true;
        }
      });
    }

    function recordSpeak(text) {
      speakCount++;

      var historyList = document.getElementById('speak-history-list');
      if (historyList) {
        var emptyEl = historyList.querySelector('.speak-history-empty');
        if (emptyEl) emptyEl.remove();

        var now = new Date();
        var timeStr = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
        var item = document.createElement('div');
        item.className = 'speak-history-item';
        var truncText = text.length > 20 ? text.substring(0, 20) + '...' : text;
        item.innerHTML = '<span class="speak-h-time">' + timeStr + '</span>' +
          '<span class="speak-h-text">' + truncText + '</span>' +
          '<span class="speak-h-status">有效</span>';
        historyList.insertBefore(item, historyList.firstChild);
      }

      updateSpeakDisplay();
      
      // 检查是否有新阶梯可领取，提示用户
      tiers.forEach(function(t) {
        if (speakCount === t.count && claimedTiers.indexOf(t.count) === -1) {
          showToast('发言达到' + t.count + '条！去领取 +' + t.reward + ' 积分', 'success');
        }
      });
    }

    // 点击领取按钮
    document.getElementById('app').addEventListener('click', function(e) {
      var btn = e.target.closest('.speak-tier-btn.claimable');
      if (!btn) return;
      var tierItem = btn.closest('.speak-tier-item');
      if (!tierItem) return;
      var tierCount = parseInt(tierItem.getAttribute('data-tier'));
      var tierReward = parseInt(tierItem.getAttribute('data-reward'));
      if (!tierCount || !tierReward) return;
      if (claimedTiers.indexOf(tierCount) !== -1) return;

      claimedTiers.push(tierCount);
      speakPoints += tierReward;

      if (typeof window._checkinScore === 'number') {
        window._checkinScore += tierReward;
        var scoreEl = document.getElementById('checkin-total-score');
        if (scoreEl) scoreEl.textContent = window._checkinScore;
      }

      btn.textContent = '已领取 ✓';
      btn.className = 'speak-tier-btn claimed';
      btn.disabled = true;

      updateSpeakDisplay();
      showToast('领取成功！+' + tierReward + ' 积分', 'success');

      // 全群通报
      var msgArea = document.getElementById('group-messages-area');
      if (msgArea) {
        var nickEl = document.querySelector('.profile-name');
        var nickname = nickEl ? nickEl.textContent.trim() : '小明';
        var sysMsg = document.createElement('div');
        sysMsg.className = 'system-msg checkin-system-msg';
        sysMsg.innerHTML = '🎉 ' + nickname + ' 发言达到 ' + tierCount + ' 条，领取了 <span class="checkin-points">+' + tierReward + ' 积分</span>';
        msgArea.appendChild(sysMsg);
        msgArea.scrollTop = msgArea.scrollHeight;
      }
    });

    window._recordGroupSpeak = function(text) {
      if (text && text.length >= 5) {
        recordSpeak(text);
      }
    };

    var speakCard = document.getElementById('activity-speak-card');
    if (speakCard) speakCard.addEventListener('click', function() {
      updateSpeakDisplay();
      navigateTo('page-speak-reward', { direction: 'forward' });
    });

    var checkinCard = document.getElementById('activity-checkin-card');
    if (checkinCard) checkinCard.addEventListener('click', function(e) {
      if (e.target.closest('.activity-btn')) return;
      navigateTo('page-group-checkin', { direction: 'forward' });
    });

    updateSpeakDisplay();
  })();

  // VIP 等级入口
  (function() {
    document.addEventListener('click', function(e) {
      if (e.target.closest('#go-vip-detail')) {
        navigateTo('page-vip', { direction: 'forward' });
      }
    });
  })();

  // =============================================
  //  支付密码功能
  // =============================================
  (function() {
    window._payPwdSet = false;
    window._payPwdPending = null;

    window._requirePayPwd = function(callback) {
      if (!window._payPwdSet) {
        window._payPwdPending = callback;
        navigateTo('page-set-pay-pwd', { direction: 'forward' });
        return;
      }
      window._payPwdPending = callback;
      showPayPwdModal();
    };

    // === 设置支付密码页面逻辑（双 dots 新版）===
    var dots1 = document.getElementById('set-pwd-dots-1');
    var dots2 = document.getElementById('set-pwd-dots-2');
    var setNumpad = document.getElementById('set-pwd-numpad');
    var notSetSection = document.getElementById('pay-pwd-not-set');
    var alreadySetSection = document.getElementById('pay-pwd-already-set');
    var payPwdStatusEl = document.getElementById('pay-pwd-status');
    var pwd1 = '';
    var pwd2 = '';
    var currentDotsField = 1;

    function updateDots(dotsEl, value) {
      if (!dotsEl) return;
      var items = dotsEl.querySelectorAll('.pwd-input-dot');
      items.forEach(function(dot, i) {
        dot.classList.toggle('filled', i < value.length);
      });
    }

    function setActiveField(field) {
      currentDotsField = field;
      if (dots1) dots1.classList.toggle('active', field === 1);
      if (dots2) dots2.classList.toggle('active', field === 2);
    }

    function resetSetup() {
      pwd1 = '';
      pwd2 = '';
      currentDotsField = 1;
      updateDots(dots1, '');
      updateDots(dots2, '');
      setActiveField(1);
    }

    function switchPayManageView() {
      if (notSetSection) notSetSection.style.display = window._payPwdSet ? 'none' : '';
      if (alreadySetSection) alreadySetSection.style.display = window._payPwdSet ? '' : 'none';
      if (payPwdStatusEl) {
        payPwdStatusEl.textContent = window._payPwdSet ? '已设置' : '未设置';
        payPwdStatusEl.classList.toggle('set', window._payPwdSet);
      }
    }

    if (dots1) dots1.addEventListener('click', function() { setActiveField(1); });
    if (dots2) dots2.addEventListener('click', function() { setActiveField(2); });

    setActiveField(1);

    if (setNumpad) {
      setNumpad.addEventListener('click', function(e) {
        var key = e.target.closest('.numpad-key');
        if (!key) return;
        var num = key.getAttribute('data-num');
        if (!num) return;

        if (num === 'del') {
          if (currentDotsField === 1) {
            pwd1 = pwd1.slice(0, -1);
            updateDots(dots1, pwd1);
          } else {
            pwd2 = pwd2.slice(0, -1);
            updateDots(dots2, pwd2);
          }
          return;
        }

        if (currentDotsField === 1) {
          if (pwd1.length >= 6) return;
          pwd1 += num;
          updateDots(dots1, pwd1);
          if (pwd1.length === 6) {
            setActiveField(2);
          }
        } else {
          if (pwd2.length >= 6) return;
          pwd2 += num;
          updateDots(dots2, pwd2);
          if (pwd2.length === 6) {
            if (pwd1 === pwd2) {
              window._payPwdSet = true;
              if (window.showToast) window.showToast('支付密码设置成功');
              resetSetup();
              switchPayManageView();
              if (window._payPwdPending) {
                history.back();
                setTimeout(function() {
                  var cb = window._payPwdPending;
                  window._payPwdPending = null;
                  if (cb) cb();
                }, 400);
              } else {
                switchPayManageView();
              }
            } else {
              if (window.showToast) window.showToast('两次输入不一致，请重新设置');
              resetSetup();
            }
          }
        }
      });
    }

    // === 钱包入口点击 ===
    var goPayPwdManage = document.getElementById('go-pay-pwd-manage');
    if (goPayPwdManage) {
      goPayPwdManage.addEventListener('click', function() {
        resetSetup();
        switchPayManageView();
        navigateTo('page-set-pay-pwd', { direction: 'forward' });
      });
    }

    // === 修改支付密码按钮 ===
    var btnChangePayPwd = document.getElementById('btn-change-pay-pwd');
    if (btnChangePayPwd) {
      btnChangePayPwd.addEventListener('click', function() {
        navigateTo('page-change-pay-pwd', { direction: 'forward' });
      });
    }

    // === 重置支付密码按钮 ===
    var btnResetPayPwd = document.getElementById('btn-reset-pay-pwd');
    if (btnResetPayPwd) {
      btnResetPayPwd.addEventListener('click', function() {
        if (confirm('确定要重置支付密码吗？重置后需要重新设置。')) {
          window._payPwdSet = false;
          resetSetup();
          switchPayManageView();
          if (window.showToast) window.showToast('支付密码已重置');
        }
      });
    }

    // === 验证弹窗逻辑 ===
    var verifyOverlay = document.getElementById('pay-pwd-overlay');
    var verifyDots = document.getElementById('verify-pwd-dots');
    var verifyNumpad = document.getElementById('verify-numpad');
    var verifyClose = document.getElementById('pay-pwd-close');
    var verifyPwd = '';

    function showPayPwdModal() {
      verifyPwd = '';
      updateVerifyDots();
      if (verifyOverlay) verifyOverlay.style.display = 'flex';
    }

    function hidePayPwdModal() {
      if (verifyOverlay) verifyOverlay.style.display = 'none';
      verifyPwd = '';
      updateVerifyDots();
    }

    function updateVerifyDots() {
      if (!verifyDots) return;
      var dots = verifyDots.querySelectorAll('.pay-pwd-dot');
      dots.forEach(function(dot, i) {
        dot.classList.toggle('filled', i < verifyPwd.length);
      });
    }

    if (verifyClose) {
      verifyClose.addEventListener('click', function() {
        hidePayPwdModal();
        window._payPwdPending = null;
      });
    }

    if (verifyOverlay) {
      verifyOverlay.addEventListener('click', function(e) {
        if (e.target === verifyOverlay) {
          hidePayPwdModal();
          window._payPwdPending = null;
        }
      });
    }

    if (verifyNumpad) {
      verifyNumpad.addEventListener('click', function(e) {
        var key = e.target.closest('.numpad-key');
        if (!key) return;
        var num = key.getAttribute('data-num');
        if (!num) return;

        if (num === 'del') {
          verifyPwd = verifyPwd.slice(0, -1);
          updateVerifyDots();
          return;
        }

        if (verifyPwd.length >= 6) return;
        verifyPwd += num;
        updateVerifyDots();

        if (verifyPwd.length === 6) {
          hidePayPwdModal();
          if (window.showToast) window.showToast('支付密码验证成功');
          var cb = window._payPwdPending;
          window._payPwdPending = null;
          if (cb) setTimeout(cb, 300);
        }
      });
    }

    // (旧 submit-pay-pwd 逻辑已移至 page-change-pay-pwd 页面处理)

    // === 转账页提交逻辑（原先未实现）===
    document.addEventListener('click', function(e) {
      var btn = e.target.closest('.transfer-submit');
      if (!btn || !btn.closest('#page-transfer')) return;
      e.stopPropagation();
      var input = document.getElementById('transfer-amount');
      var amount = input && parseFloat(input.value);
      if (!amount || amount <= 0) { alert('请输入转账金额'); return; }
      window._requirePayPwd(function() {
        if (window.showToast) window.showToast('转账 ¥' + amount.toFixed(2) + ' 已发送');
        navigateTo('page-chat', { direction: 'back' });
      });
    });
  })();

});
