// ============================================================
//  Dữ liệu game: vật phẩm, kẻ địch, bản đồ, nhân vật
// ============================================================

export const ITEMS = {
  bread: { name: 'Bánh mì tro', heal: 14, price: 8, desc: 'Bánh nướng trong tro ấm. Hồi 14 HP.' },
  candy: { name: 'Kẹo rêu', heal: 26, price: 16, desc: 'Ngọt lịm và hơi nhớt. Hồi 26 HP.' },
  tea: { name: 'Trà tro', heal: 45, price: 28, desc: 'Ấm từ cổ họng xuống tận ngón chân. Hồi 45 HP.' },
  honey: { name: 'Mật đom', heal: 70, price: 46, desc: 'Ánh sáng cô đọng thành giọt. Hồi 70 HP.' },
};

export const ENEMIES = {
  moss: {
    id: 'moss',
    name: 'BỌ RÊU',
    sprite: 'moss',
    scale: 3.4,
    hp: 18,
    atk: 2,
    def: 1,
    exp: 6,
    gold: 5,
    mercyAt: 100,
    theme: 'moss',
    intro: 'Bọ Rêu bò ra từ đám rêu, rung râu nhìn bạn đầy lo lắng.',
    banter: [
      'Bọ Rêu thu mình lại, cố tỏ ra thật nhỏ.',
      'Bọ Rêu lăn qua lăn lại, phát ra tiếng lách tách.',
      'Bọ Rêu nghiêng đầu, như muốn hỏi bạn là ai.',
      'Bọ Rêu khẽ gõ râu vào nền đá.',
    ],
    acts: [
      { label: 'Chào', warmth: 40, text: 'Bạn cúi xuống, vẫy tay thật chậm.\nBọ Rêu khẽ rung râu — nó bớt sợ hơn một chút.' },
      { label: 'Khen mai', warmth: 35, text: 'Bạn khen chiếc mai xanh mướt của nó.\nBọ Rêu xoay một vòng để khoe mai.' },
      { label: 'Hát', warmth: 45, text: 'Bạn khe khẽ ngân một giai điệu.\nBọ Rêu gõ râu theo nhịp, nghe rất chăm chú.' },
    ],
    patterns: ['rain', 'sweep'],
    attacks: 2,
    spareLine: 'Bọ Rêu lăn tròn, khẽ chạm vào ngón tay bạn rồi bò đi.',
    killLine: 'Bọ Rêu vỡ ra thành một nắm tro lạnh.',
    spareReward: 'Bọ Rêu để lại cho bạn một viên đá nhỏ sáng lấp lánh.',
  },
  shroom: {
    id: 'shroom',
    name: 'NẤM BUỒN',
    sprite: 'shroom',
    scale: 3.4,
    hp: 26,
    atk: 3,
    def: 1,
    exp: 9,
    gold: 7,
    mercyAt: 100,
    theme: 'moss',
    intro: 'Nấm Buồn đứng im trong góc, mũ cụp xuống như một chiếc ô bị mưa.',
    banter: [
      'Nấm Buồn thở dài, bào tử bay lơ lửng.',
      'Nấm Buồn lẩm bẩm: "Chẳng ai muốn nghe chuyện của một cây nấm..."',
      'Nấm Buồn co mũ lại, che kín mặt.',
      'Nấm Buồn khẽ hỏi: "Cậu có vội đi không?"',
    ],
    acts: [
      { label: 'Nghe', warmth: 45, text: 'Bạn ngồi xuống, khoanh chân, nghe thật lâu.\nNấm Buồn kể về những ngày nắng đã đi qua đây.' },
      { label: 'An ủi', warmth: 30, text: 'Bạn nói: "Buồn cũng không sao đâu."\nNấm Buồn im lặng, rồi khẽ gật mũ.' },
      { label: 'Kể chuyện', warmth: 40, text: 'Bạn kể về bầu trời trên kia — những đám mây trắng như mũ nấm.\nNấm Buồn nghe đến quên cả run.' },
    ],
    patterns: ['rain', 'aimed'],
    attacks: 2,
    spareLine: 'Nấm Buồn ngẩng mũ lên, lần đầu tiên sau rất lâu.',
    killLine: 'Nấm Buồn đổ xuống, bào tử tan vào bóng tối.',
    spareReward: 'Nấm Buồn tặng bạn một viên kẹo rêu còn nguyên vỏ.',
  },
  bird: {
    id: 'bird',
    name: 'CHIM TRO',
    sprite: 'bird',
    scale: 3.4,
    hp: 22,
    atk: 3,
    def: 1,
    exp: 8,
    gold: 6,
    mercyAt: 100,
    theme: 'ash',
    intro: 'Chim Tro sà xuống, đôi cánh xám rắc tro lên vai bạn.',
    banter: [
      'Chim Tro bay vòng quanh, tìm mãi một hướng.',
      'Chim Tro kêu một tiếng ngắn, nghe như câu hỏi.',
      'Chim Tro đậu xuống, nghiêng đầu nhìn bạn.',
      'Chim Tro rũ cánh, tro rơi lả tả.',
    ],
    acts: [
      { label: 'Vẫy tay', warmth: 35, text: 'Bạn vẫy tay thật rộng.\nChim Tro tưởng bạn cũng đang bay, liền bắt chước.' },
      { label: 'Chỉ đường', warmth: 45, text: 'Bạn chỉ về phía chân trời trên kia.\nChim Tro nhìn theo rất lâu, đôi mắt sáng lên.' },
      { label: 'Hát', warmth: 40, text: 'Bạn ngân một nốt thật dài.\nChim Tro hót theo — hai giọng hoà vào nhau.' },
    ],
    patterns: ['sweep', 'ring'],
    attacks: 2,
    spareLine: 'Chim Tro đậu lên vai bạn một thoáng rồi bay đi, hướng thẳng lên cao.',
    killLine: 'Chim Tro rơi xuống, lông tan thành tro bay lên trần hang.',
    spareReward: 'Chim Tro làm rơi một chiếc lông vũ ánh bạc.',
  },
  sentinel: {
    id: 'sentinel',
    name: 'LÍNH SẮT VỤN',
    sprite: 'sentinel',
    scale: 3,
    hp: 60,
    atk: 3,
    def: 2,
    exp: 24,
    gold: 26,
    mercyAt: 100,
    theme: 'ash',
    canFlee: false,
    intro: 'Lính Sắt Vụn chặn giữa cầu, gỉ sét kêu cót két theo từng bước chân.',
    banter: [
      'Lính Sắt Vụn gõ giáo xuống cầu: "DỪNG LẠI."',
      'Lính Sắt Vụn: "MỆNH LỆNH: KHÔNG AI QUA CẦU."',
      'Khớp tay của Lính Sắt Vụn kẹt cứng, tiếng gỉ sét vang lên.',
      'Lính Sắt Vụn: "TA... TA ĐÃ GIỮ CẦU NÀY BAO NHIÊU NĂM RỒI?"',
    ],
    acts: [
      { label: 'Chào', warmth: 30, text: 'Bạn chào bằng giọng lịch sự nhất.\nLính Sắt Vụn ngập ngừng: "CHÀO... ĐỒNG ĐỘI?"' },
      { label: 'Sửa khớp', warmth: 40, text: 'Bạn vặn lại khớp tay đã kẹt của nó.\nLính Sắt Vụn thử vung giáo, gỉ sét rơi lả tả.' },
      { label: 'Hỏi', warmth: 35, text: 'Bạn hỏi: "Ai ra lệnh cho ngài giữ cầu?"\nLính Sắt Vụn im rất lâu: "KHÔNG... KHÔNG AI CẢ."' },
    ],
    patterns: ['rain', 'aimed', 'sweep', 'ring'],
    attacks: 3,
    phase2At: 30,
    spareLine: 'Lính Sắt Vụn hạ giáo, cúi đầu: "ĐƯỜNG... ĐÃ MỞ. ĐI CẨN THẬN."',
    killLine: 'Lính Sắt Vụn đổ sập xuống, tiếng gỉ sét ngưng hẳn giữa cầu.',
    spareReward: 'Lính Sắt Vụn đưa bạn một mảnh huy hiệu hoen gỉ.',
  },
  king: {
    id: 'king',
    name: 'VUA TRO',
    sprite: 'king',
    scale: 2.6,
    hp: 140,
    atk: 4,
    def: 3,
    exp: 60,
    gold: 60,
    mercyAt: 110,
    theme: 'throne',
    canFlee: false,
    isBoss: true,
    intro: 'Vua Tro ngồi trên ngai, thân hình tan dần thành khói.\n"NGƯƠI CÒN ẤM... HÃY Ở LẠI ĐÂY."',
    banter: [
      'Vua Tro: "CẢ NGÀN NĂM. KHÔNG MỘT AI NGỒI CẠNH TA."',
      'Vua Tro: "NGỌN LỬA NÀY SẮP TẮT. TA CHỈ CẦN MỘT HƠI ẤM."',
      'Vua Tro chống tay lên ngai, tro rơi khỏi gương mặt.',
      'Vua Tro: "NGƯƠI... SỢ TA SAO?"',
      'Vua Tro nhìn bàn tay mình đang tan ra: "TA KHÔNG CÒN NHIỀU THỜI GIAN."',
    ],
    acts: [
      { label: 'Nghe', warmth: 30, text: 'Bạn ngồi xuống trước ngai, nghe hết câu chuyện.\nVua Tro kể về ngọn núi đã nguội lạnh từ rất lâu.' },
      { label: 'Nắm tay', warmth: 30, text: 'Bạn chìa tay ra.\nVua Tro nhìn bàn tay ấy rất lâu, rồi khẽ đặt tay mình lên — tro ấm dần.' },
      { label: 'Kể về mặt trời', warmth: 25, text: 'Bạn kể về mặt trời, về buổi sáng có sương và tiếng chim.\nVua Tro nghe đến mức quên cả thở.' },
      { label: 'Gọi tên', warmth: 30, stageOnly: 2, text: 'Bạn hỏi tên thật của ngài.\n"KHOAN... ĐÃ LÂU LẮM RỒI KHÔNG AI GỌI."\nNgài khẽ nói tên mình.' },
    ],
    patterns: ['ring', 'aimed', 'spiral', 'walls'],
    attacks: 4,
    phase2At: 70,
    spareLine: 'Vua Tro cúi đầu thật sâu.\nTro trên người ngài bay lên — không phải tan biến, mà là toả sáng.',
    killLine: 'Vua Tro đổ xuống khỏi ngai.\nNgọn lửa cuối cùng trong Hầm Tro vụt tắt.',
    spareReward: 'Vua Tro trao bạn ngọn lửa nhỏ trên lòng bàn tay.',
  },
};

// ------------------------------------------------------------
// Bản đồ: 20 x 15 ô, mỗi ô 32px
//   # tường   . sàn   , cỏ/rêu   ~ vực   w nước
//   O đá      T cây   m nấm      f hoa sáng
//   l đèn     b thùng | cột      _ thảm  > lối ra
// ------------------------------------------------------------
export const ROOMS = {
  wake: {
    id: 'wake',
    title: 'RÊU XANH',
    subtitle: 'nơi cơn rơi kết thúc',
    theme: 'moss',
    music: 'field',
    map: [
      '####################',
      '#......m...........#',
      '#..........O.......#',
      '#..O...............#',
      '#....,,,,,,,,......#',
      '#...,,,,,,,,,,.....#',
      '#...,,,,,,,,,,.....>',
      '#...,,,,,,,,.......>',
      '#....,,,,,,........#',
      '#......,,,,........#',
      '#..m...........l...#',
      '#..................#',
      '#.......f..........#',
      '#..................#',
      '####################',
    ],
    spawn: { x: 10, y: 6, facing: 'down' },
    saveSpawn: { x: 16, y: 10.4, facing: 'up' },
    exits: [
      { x: 19, y: 6, w: 1, h: 2, to: 'hall', spawn: { x: 1.6, y: 7, facing: 'right' } },
    ],
    encounters: null,
    objects: [
      { type: 'sign', id: 'sign_wake', x: 7.5, y: 8.6, lines: [
        { text: 'HẦM TRO — nơi những thứ bị bỏ quên vẫn còn ấm.' },
        { text: 'Ký tên: ... ai đó đã ở đây rất lâu rồi.' },
      ] },
      { type: 'chest', id: 'chest_wake', x: 4.5, y: 11.6, item: 'candy', count: 1 },
      { type: 'lamp', id: 'lamp_wake', x: 16.5, y: 10.6 },
      { type: 'npc', id: 'dom', x: 12.5, y: 8.4, sprite: 'dom', scale: 2, name: 'Đom', bob: true },
    ],
  },

  hall: {
    id: 'hall',
    title: 'HÀNH LANG RÊU',
    subtitle: 'tiếng bước chân có người nghe thấy',
    theme: 'hall',
    music: 'field',
    map: [
      '####################',
      '#..................#',
      '#..|...........|...#',
      '#..................#',
      '#....,,,,,,,,......#',
      '#....,,,,,,,,......#',
      '>.....,,,,,,.......>',
      '>.....,,,,,,.......>',
      '#.....,,,,,,.......#',
      '#....,,,,,,,,......#',
      '#..................#',
      '#..b...........b...#',
      '#..................#',
      '#..m...........f...#',
      '####################',
    ],
    spawn: { x: 2, y: 7, facing: 'right' },
    exits: [
      { x: 0, y: 6, w: 1, h: 2, to: 'wake', spawn: { x: 18, y: 7, facing: 'left' } },
      { x: 19, y: 6, w: 1, h: 2, to: 'bridge', spawn: { x: 1.6, y: 7, facing: 'right' } },
    ],
    encounters: { pool: ['moss', 'shroom'], min: 620, max: 980 },
    objects: [
      { type: 'npc', id: 'baMoc', x: 10.5, y: 7.2, sprite: 'baMoc', scale: 2.1, name: 'Bà Mốc', bob: true },
      { type: 'sign', id: 'sign_hall', x: 4.5, y: 12.6, lines: [
        { text: 'Khi ai đó run rẩy, hãy thử NGHE trước khi ĐÁNH.' },
        { text: 'Tro nhớ mọi bàn tay đã chạm vào nó.' },
      ] },
    ],
  },

  bridge: {
    id: 'bridge',
    title: 'CẦU TRO',
    subtitle: 'người gác cầu đã quên mất lý do',
    theme: 'ash',
    music: 'field',
    map: [
      '####################',
      '#..................#',
      '#..O............O..#',
      '#..................#',
      '#..................#',
      '#.~~~~~~....~~~~~~.#',
      '>.~~~~~~....~~~~~~.>',
      '>.~~~~~~....~~~~~~.>',
      '#.~~~~~~....~~~~~~.#',
      '#.~~~~~~....~~~~~~.#',
      '#..................#',
      '#..l...........l...#',
      '#..................#',
      '#..................#',
      '####################',
    ],
    spawn: { x: 2, y: 7, facing: 'right' },
    exits: [
      { x: 0, y: 6, w: 1, h: 2, to: 'hall', spawn: { x: 18, y: 7, facing: 'left' } },
      {
        x: 19, y: 6, w: 1, h: 2, to: 'forest',
        spawn: { x: 1.6, y: 7, facing: 'right' },
        requires: 'boss_bridge',
        blockedText: [
          { text: 'Một lớp tro lạnh phủ kín lối đi.' },
          { text: 'Dường như chỉ khi người gác cầu yên lòng, đường mới mở.' },
        ],
      },
    ],
    encounters: null,
    objects: [
      { type: 'lamp', id: 'lamp_bridge', x: 3.5, y: 11.6 },
      { type: 'chest', id: 'chest_bridge', x: 17.5, y: 3.6, item: 'tea', count: 1 },
      { type: 'boss', id: 'sentinel', enemy: 'sentinel', flag: 'boss_bridge', x: 10, y: 6.6 },
    ],
  },

  forest: {
    id: 'forest',
    title: 'RỪNG TRO',
    subtitle: 'cây cối ở đây nhớ mùa hè',
    theme: 'forest',
    music: 'field',
    map: [
      '####################',
      '#..T.....,,,,..T...#',
      '#........,,,,,,,,..#',
      '#...,,,,,,,,,,,,,..#',
      '#...,,,,,,,,,,,,,..#',
      '#.,,,,,,,,,w,,,,,,.>',
      '#.,,,,,,,wwww,,,,,.>',
      '#..,,,,,,,ww,,,,,,.#',
      '#...,,,,,,,,,,,,,..#',
      '#.....,,,,,,,,,....#',
      '#..T.......,,,,....#',
      '#...........,,,....#',
      '#.....,,,..........#',
      '#..................#',
      '####################',
    ],
    spawn: { x: 2, y: 7, facing: 'right' },
    exits: [
      { x: 0, y: 6, w: 1, h: 2, to: 'bridge', spawn: { x: 18, y: 7, facing: 'left' } },
      { x: 19, y: 5, w: 1, h: 3, to: 'market', spawn: { x: 1.6, y: 7, facing: 'right' } },
    ],
    encounters: { pool: ['shroom', 'bird', 'moss'], min: 560, max: 900 },
    objects: [
      { type: 'spring', id: 'spring_forest', x: 10.5, y: 7.6 },
      { type: 'npc', id: 'dom', x: 5.5, y: 3.4, sprite: 'dom', scale: 2, name: 'Đom', bob: true },
      { type: 'sign', id: 'sign_forest', x: 3.5, y: 12.6, lines: [
        { text: 'Suối Tro: uống một ngụm, ấm lại cả đường dài.' },
        { text: '(Nước ở đây chỉ ấm một lần. Hãy dùng khi thật cần.)' },
      ] },
    ],
  },

  market: {
    id: 'market',
    title: 'CHỢ TRO',
    subtitle: 'nơi người ta vẫn còn trao nhau thứ gì đó',
    theme: 'market',
    music: 'field',
    map: [
      '####################',
      '#..................#',
      '#...b...b...b......#',
      '#..................#',
      '#.._____________...#',
      '#.._____________...#',
      '>.._____________...>',
      '>.._____________...>',
      '#.._____________...#',
      '#..................#',
      '#..l...........l...#',
      '#..................#',
      '#...b...........b..#',
      '#..................#',
      '####################',
    ],
    spawn: { x: 2, y: 7, facing: 'right' },
    exits: [
      { x: 0, y: 6, w: 1, h: 2, to: 'forest', spawn: { x: 18, y: 7, facing: 'left' } },
      {
        x: 19, y: 6, w: 1, h: 2, to: 'throne',
        spawn: { x: 1.6, y: 7, facing: 'right' },
        requires: 'met_nhim',
        blockedText: [
          { text: 'Nhím đứng chắn trước lối vào Ngai Tro, tay khoanh trước ngực.' },
          { text: '"Nói chuyện với tôi một câu đã. Đường này không mở cho người vội."' },
        ],
      },
    ],
    encounters: null,
    objects: [
      { type: 'npc', id: 'nhim', x: 10.5, y: 4.6, sprite: 'nhim', scale: 2.1, name: 'Nhím', bob: true, stall: true },
      { type: 'lamp', id: 'lamp_market', x: 15.5, y: 10.6 },
      { type: 'sign', id: 'sign_market', x: 4.5, y: 12.6, lines: [
        { text: 'CHỢ TRO — đổi tro lấy thứ ấm.' },
        { text: 'Nhím bán: bánh mì, kẹo rêu, trà tro, mật đom.' },
      ] },
    ],
  },

  throne: {
    id: 'throne',
    title: 'NGAI TRO',
    subtitle: 'ngọn lửa cuối cùng của Hầm Tro',
    theme: 'throne',
    music: 'boss',
    map: [
      '####################',
      '#|................|#',
      '#|................|#',
      '#|.....######.....|#',
      '#|................|#',
      '#|.....______.....|#',
      '>|.....______.....|#',
      '>|.....______.....|#',
      '#|.....______.....|#',
      '#|.....______.....|#',
      '#|................|#',
      '#|................|#',
      '#|................|#',
      '#..................#',
      '####################',
    ],
    spawn: { x: 2, y: 7, facing: 'right' },
    exits: [],
    encounters: null,
    autosave: true,
    objects: [
      { type: 'lamp', id: 'lamp_throne', x: 4.5, y: 12.6 },
      { type: 'boss', id: 'king', enemy: 'king', flag: 'boss_king', x: 10, y: 10.4, final: true },
    ],
  },
};

// ------------------------------------------------------------
// Nhân vật — hội thoại thay đổi theo tiến trình
// ------------------------------------------------------------
const domVoice = (text) => ({ speaker: 'Đom', portrait: 'dom', text });

export const NPC_TALK = {
  dom(ctx) {
    const { flags, room } = ctx;
    if (!flags.met_dom) return [];
    if (room === 'wake') {
      return [
        domVoice('Cậu tỉnh rồi! Tốt quá. Tôi là Đom — con đom đóm duy nhất còn thức ở tầng này.'),
        domVoice('Đây là Rêu Xanh, tầng trên cùng của Hầm Tro. Muốn ra ngoài thì đi về phía đông.'),
        domVoice('À, và... đừng ăn nấm biết nói. Chuyện dài lắm.'),
      ];
    }
    if (room === 'forest') {
      return [
        domVoice('Suối Tro kìa. Nghe nói người uống một ngụm sẽ thấy ấm suốt cả ngày.'),
        domVoice('Đằng trước là Chợ Tro. Cậu có tiền chưa? Nhím không cho nợ đâu.'),
        domVoice('Mà này... cậu để ý không? Càng xuống sâu, tro càng lạnh.'),
      ];
    }
    return [
      domVoice('Tôi vẫn ở đây. Sáng nay tôi thấy một ngôi sao — hay là vết nứt trên trần hang nhỉ.'),
      domVoice('Cậu nghĩ trên mặt đất có gì? Kể tôi nghe với, khi nào rảnh.'),
    ];
  },

  baMoc(ctx) {
    const { flags } = ctx;
    if (!flags.met_moc) {
      return {
        lines: [
          { speaker: 'Bà Mốc', portrait: 'baMoc', text: 'Ôi, một đứa bé bằng xương bằng thịt! Lại đây nào, để bà nhìn cho kỹ.' },
          { speaker: 'Bà Mốc', portrait: 'baMoc', text: 'Hầm Tro này đã lạnh lắm rồi. Người sống sót rơi xuống đây... chưa từng có ai.' },
          { speaker: 'Bà Mốc', portrait: 'baMoc', text: 'Cầm lấy ít bánh mì. Đường xuống Ngai Tro dài lắm.' },
          { speaker: 'Bà Mốc', portrait: 'baMoc', text: 'Mà nghe bà dặn: mấy sinh vật dưới này đáng sợ là vì chúng đang sợ cậu. Nếu đánh không nổi, hãy thử trò chuyện.' },
          { speaker: 'Bà Mốc', portrait: 'baMoc', text: 'Khi nào mệt, cứ quay lại. Bà luôn còn bánh.' },
        ],
        reward: { items: { bread: 2 }, flag: 'met_moc', heal: true },
      };
    }
    return {
      lines: [
        { speaker: 'Bà Mốc', portrait: 'baMoc', text: 'Quay lại rồi à. Ngồi xuống đây, bà hâm lại chút trà.' },
        { speaker: 'Bà Mốc', portrait: 'baMoc', text: flags.boss_bridge ? 'Người gác cầu đã yên lòng. Bà nghe tiếng giáo của nó gõ xuống cầu — lần đầu tiên nhẹ nhõm như vậy.' : 'Đi đường cẩn thận nhé. Cầu Tro có người gác.' },
      ],
      reward: { heal: true },
    };
  },

  nhim(ctx) {
    const { flags } = ctx;
    if (!flags.met_nhim) {
      return {
        lines: [
          { speaker: 'Nhím', portrait: 'nhim', text: 'Hừm. Một đứa trẻ. Đến từ trên mặt đất, phải không?' },
          { speaker: 'Nhím', portrait: 'nhim', text: 'Tôi bán đồ ở đây. Không cho nợ, không mặc cả. Nhưng mà...' },
          { speaker: 'Nhím', portrait: 'nhim', text: 'Nếu cậu chịu đứng nói chuyện với tôi một lát, tôi giảm giá cho. Lâu rồi chẳng ai đứng lại cả.' },
          { speaker: 'Nhím', portrait: 'nhim', text: 'Được rồi, coi như quen nhau. Lối vào Ngai Tro phía đông. Đi cẩn thận.' },
        ],
        reward: { flag: 'met_nhim', openShop: true },
      };
    }
    return { lines: [{ speaker: 'Nhím', portrait: 'nhim', text: 'Vẫn còn sống à? Tốt. Mua gì thì nói.' }], reward: {} };
  },
};

// Chọn vật phẩm bán trong shop
export const SHOP_STOCK = ['bread', 'candy', 'tea', 'honey'];

// Thoại trước trận đánh trùm
export const BOSS_INTRO = {
  sentinel: [
    { text: 'Lính Sắt Vụn chặn giữa cầu. Gỉ sét trên giáo nó phủ một lớp tro dày.' },
    { speaker: 'Lính Sắt Vụn', text: '"DỪNG LẠI. KHÔNG AI QUA CẦU."' },
    { speaker: 'Đom', portrait: 'dom', text: 'Nó canh cây cầu này lâu hơn cả tôi sống. Nó không ác — nó chỉ quên mất mình đang đợi ai.' },
    { text: 'Gợi ý: dùng NÓI để tìm cách khiến nó yên lòng, rồi dùng THA.' },
  ],
  king: [
    { text: 'Đại sảnh tối om. Trên ngai, một bóng người làm bằng tro đang khẽ thở.' },
    { speaker: 'Vua Tro', text: '"NGƯƠI CÒN ẤM. TA CẢM NHẬN ĐƯỢC."' },
    { speaker: 'Vua Tro', text: '"Ở LẠI ĐÂY. CHỈ CẦN MỘT CHÚT HƠI ẤM... NGỌN LỬA NÀY SẼ CHÁY LẠI."' },
    { speaker: 'Đom', portrait: 'dom', text: 'Cậu ấy cần hơi ấm thật... nhưng không phải bằng cách lấy của người khác.' },
    { text: 'Gợi ý: NGHE ngài ấy. Không phải để thắng — để hiểu.' },
  ],
};

export const BOSS_OUTRO = {
  sentinel: [
    { speaker: 'Lính Sắt Vụn', text: '"TA... NHỚ RA RỒI. TA ĐỨNG ĐÂY ĐỂ ĐỢI NGƯỜI MỞ LỐI, KHÔNG PHẢI ĐỂ CHẶN."' },
    { speaker: 'Đom', portrait: 'dom', text: 'Thấy chưa? Chỉ cần một người chịu đứng lại nghe.' },
    { text: 'Cầu Tro sáng lên một vệt ấm. Lối sang Rừng Tro đã mở.' },
  ],
  king: [
    { speaker: 'Vua Tro', text: '"TA... XIN LỖI. TA CHỈ KHÔNG MUỐN NGỌN LỬA NÀY TẮT TRONG CÔ ĐƠN."' },
    { speaker: 'Đom', portrait: 'dom', text: 'Không ai phải tắt một mình cả. Đó là điều tôi học được từ cậu ấy.' },
  ],
};

export const SPRING_LINES = {
  first: [
    { text: 'Bạn vốc một ngụm nước từ Suối Tro.' },
    { text: 'Hơi ấm lan từ cổ họng xuống tận ngón chân. HP đã hồi phục hoàn toàn.' },
  ],
  used: [
    { text: 'Nước suối lúc này chỉ còn âm ấm.' },
    { text: '(Suối chỉ trao hơi ấm một lần. Hãy trân trọng nó.)' },
  ],
};
