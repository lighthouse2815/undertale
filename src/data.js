// ============================================================
//  Dữ liệu game: vật phẩm, kẻ địch, bản đồ, nhân vật
// ============================================================

export const ITEMS = {
  bread: { name: 'Bánh mì tro', heal: 14, price: 8, desc: 'Bánh nướng trong tro ấm. Hồi 14 HP.' },
  candy: { name: 'Kẹo rêu', heal: 26, price: 16, desc: 'Ngọt lịm và hơi nhớt. Hồi 26 HP.' },
  tea: { name: 'Trà tro', heal: 45, price: 28, desc: 'Ấm từ cổ họng xuống tận ngón chân. Hồi 45 HP.' },
  honey: { name: 'Mật đom', heal: 70, price: 46, desc: 'Ánh sáng cô đọng thành giọt. Hồi 70 HP.' },
  kem: { name: 'Kem tuyết', heal: 55, price: 36, desc: 'Lạnh buốt rồi ấm dần trong ngực. Hồi 55 HP.' },
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
  frog: {
    id: 'frog',
    name: 'ẾCH TUYẾT',
    sprite: 'frog',
    scale: 3,
    hp: 30,
    atk: 3,
    def: 1,
    exp: 11,
    gold: 8,
    mercyAt: 100,
    theme: 'snow',
    intro: 'Ếch Tuyết nhảy ra khỏi đống tuyết, da xanh lấm tấm băng.',
    banter: [
      'Ếch Tuyết ngồi im, cổ họng phồng lên rồi xẹp xuống.',
      'Ếch Tuyết nghiêng đầu: "Ribbit?"',
      'Ếch Tuyết nhảy tại chỗ, tuyết bắn tung toé.',
      'Ếch Tuyết nhìn bạn chằm chằm như đang cân nhắc điều gì đó.',
    ],
    acts: [
      { label: 'Chào', warmth: 35, text: 'Bạn cúi xuống chào thật lễ phép.\nẾch Tuyết chớp mắt: "Ribbit, ribbit." (Nghe như "chào bạn".)' },
      { label: 'Nhảy thi', warmth: 45, text: 'Bạn nhảy một cái thật cao.\nẾch Tuyết thích chí, nhảy theo — cao hơn cả bạn.' },
      { label: 'Khen da', warmth: 30, text: 'Bạn khen làn da xanh mướt của nó.\nẾch Tuyết ưỡn ngực, tự hào ra mặt.' },
    ],
    patterns: ['rain', 'aimed'],
    attacks: 2,
    spareLine: 'Ếch Tuyết nhảy lên vai bạn một cái rồi nhảy xuống tuyết, biến mất sau gò đất.',
    killLine: 'Ếch Tuyết lạnh cứng lại, rồi tan thành một vũng nước mỏng.',
    spareReward: 'Ếch Tuyết để lại một viên sỏi tuyết lấp lánh.',
  },
  drek: {
    id: 'drek',
    name: 'TUYẾT LONG',
    sprite: 'drek',
    scale: 3.2,
    hp: 34,
    atk: 3,
    def: 2,
    exp: 13,
    gold: 10,
    mercyAt: 100,
    theme: 'snow',
    intro: 'Tuyết Long sà xuống từ cành thông, hơi thở phả ra sương trắng.',
    banter: [
      'Tuyết Long kể một câu chuyện cười dở tệ về băng đá.',
      'Tuyết Long: "Cậu có thấy lạnh không? Tớ thì... lạnh từ trong ra."',
      'Tuyết Long xếp cánh lại, hắt xì một cái ra tuyết.',
      'Tuyết Long lẩm bẩm: "Ở đây chẳng ai cười với tớ cả."',
    ],
    acts: [
      { label: 'Cười', warmth: 40, text: 'Bạn cười thật to — không phải vì câu đùa, mà vì nó kể quá nhiệt tình.\nTuyết Long sáng cả mắt: "CẬU CƯỜI RỒI!"' },
      { label: 'Khen lông', warmth: 35, text: 'Bạn khen bộ lông bạc óng ánh của nó.\nTuyết Long xoay người khoe dưới ánh sáng xanh.' },
      { label: 'Kể chuyện mùa hè', warmth: 45, text: 'Bạn kể về mùa hè: nắng vàng, ve kêu, kem chảy nhanh.\nTuyết Long nghe mà quên cả vỗ cánh.' },
    ],
    patterns: ['rain', 'sweep', 'ring'],
    attacks: 2,
    spareLine: 'Tuyết Long bay lên khỏi tầm tay, lượn một vòng rồi thả xuống một chiếc lông bạc.',
    killLine: 'Tuyết Long rơi xuống mặt tuyết, đôi cánh vỡ thành bụi băng.',
    spareReward: 'Tuyết Long tặng bạn một chiếc lông bạc mát lạnh.',
  },
  cap: {
    id: 'cap',
    name: 'MŨ BĂNG',
    sprite: 'cap',
    scale: 3.2,
    hp: 38,
    atk: 4,
    def: 2,
    exp: 15,
    gold: 12,
    mercyAt: 100,
    theme: 'snow',
    intro: 'MŨ BĂNG đội chiếc mũ băng trên đầu, kiêu hãnh đứng giữa đường.',
    banter: [
      'MŨ BĂNG chỉnh lại mũ: "Nhìn kỹ đi. Đây là tác phẩm."',
      'MŨ BĂNG hát lẩm nhẩm một bài về băng, lệch nửa cung.',
      'MŨ BĂNG: "Một ngày nào đó, mũ ta sẽ cao đến tận trần hang."',
      'MŨ BĂNG hắt xì. Một mảnh mũ rơi xuống. Nó vội nhặt lên.',
    ],
    acts: [
      { label: 'Khen mũ', warmth: 40, text: 'Bạn nói: "Cái mũ đẹp thật."\nMŨ BĂNG đỏ mặt (khó thấy, nhưng bạn thấy): "Tất nhiên. Tôi tự làm đấy."' },
      { label: 'Hỏi thăm', warmth: 35, text: 'Bạn hỏi mũ được làm từ gì.\nMŨ BĂNG kể vanh vách cả quy trình — nghe rất thú vị.' },
      { label: 'Đội thử', warmth: 45, text: 'Bạn xin đội thử chiếc mũ một lát.\nMŨ BĂNG run lên hồi hộp, rồi gật đầu: "Cẩn thận nhé."' },
    ],
    patterns: ['walls', 'rain', 'aimed'],
    attacks: 3,
    spareLine: 'MŨ BĂNG cúi chào thật sâu, chiếc mũ vẫn nguyên vẹn trên đầu.',
    killLine: 'Chiếc mũ vỡ thành trăm mảnh băng, tan vào tuyết.',
    spareReward: 'MŨ BĂNG tặng bạn một mảnh băng trong veo không bao giờ tan.',
  },
  guard: {
    id: 'guard',
    name: 'CHÓ TUYẾT KHỔNG LỒ',
    sprite: 'guard',
    scale: 3,
    hp: 90,
    atk: 4,
    def: 3,
    exp: 36,
    gold: 42,
    mercyAt: 100,
    theme: 'snow',
    canFlee: false,
    isBoss: true,
    intro: 'Một con chó trắng to như cả căn chòi nằm chắn giữa đường tuần tra.\nNó mở mắt, nhìn bạn, rồi vẫy đuôi — hơi đất tuyết bay mù mịt.',
    banter: [
      'Chó Tuyết Khổng Lồ cọ đầu vào chân bạn, suýt hất bạn ngã.',
      'Chó Tuyết Khổng Lồ: "GÂU!" (Nghe như: "Chơi không?")',
      'Chó Tuyết Khổng Lồ gõ chân xuống tuyết, tạo ra cả một trận địa chấn nhỏ.',
      'Chó Tuyết Khổng Lồ nằm lăn, phơi bụng ra. Rõ ràng đây không phải tư thế tấn công.',
      'Chó Tuyết Khổng Lồ nhìn bạn: "Gâu gâu?" (Nghe như: "Cậu thích tớ không?")',
    ],
    acts: [
      { label: 'Vuốt ve', warmth: 35, text: 'Bạn với tay vuốt đầu nó — tay bạn chỉ chạm tới đúng cái mũi.\nChó Tuyết Khổng Lồ híp mắt, rung rung cả người vì thích.' },
      { label: 'Chơi ném', warmth: 40, text: 'Bạn ném một cục tuyết đi thật xa.\nNó lao theo như một quả núi trắng đang chạy, rồi mang cục tuyết về — đã tan thành nước.' },
      { label: 'Gọi tên', warmth: 45, stageOnly: 2, text: 'Bạn gọi nó bằng cái tên nghe thật thân thương.\nNó sụp xuống ngay trước chân bạn, cái đuôi ngoáy tít.' },
    ],
    patterns: ['sweep', 'ring', 'walls', 'aimed'],
    attacks: 3,
    phase2At: 45,
    spareLine: 'Chó Tuyết Khổng Lồ nằm xuống, lấy mũi cào tuyết sang hai bên — để lộ lối đi.\nRồi nó ngủ ngay tại chỗ, đuôi vẫn ngoáy.',
    killLine: 'Chó Tuyết Khổng Lồ gục xuống. Tuyết quanh nó thôi không còn lấp lánh nữa.',
    spareReward: 'Chó Tuyết Khổng Lồ cọ mũi vào tay bạn, để lại một sợi lông trắng mềm như mây.',
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
    saveSpawn: { x: 16, y: 11, facing: 'up' },
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
      { x: 19, y: 6, w: 1, h: 2, to: 'bridge', spawn: { x: 1, y: 7, facing: 'right' } },
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
    spawn: { x: 1, y: 7, facing: 'right' },
    exits: [
      { x: 0, y: 6, w: 1, h: 2, to: 'hall', spawn: { x: 18, y: 7, facing: 'left' } },
      {
        x: 19, y: 6, w: 1, h: 2, to: 'snow1',
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

  snow1: {
    id: 'snow1',
    title: 'ĐỒNG TUYẾT TRO',
    subtitle: 'tuyết ở đây rơi từ trước khi có tên gọi',
    theme: 'snow',
    music: 'snow',
    map: [
      '####################',
      '#..................#',
      '#...ss......ss.....#',
      '#....s......s......#',
      '#........p.........#',
      '#.....c.......v....#',
      '>..................>',
      '>................c.>',
      '#........p.........#',
      '#.....s.......s....#',
      '#..................#',
      '#..p...........p...#',
      '#..................#',
      '#........c.........#',
      '####################',
    ],
    spawn: { x: 2, y: 7, facing: 'right' },
    exits: [
      { x: 0, y: 6, w: 1, h: 2, to: 'bridge', spawn: { x: 18, y: 7, facing: 'left' } },
      { x: 19, y: 6, w: 1, h: 2, to: 'snow2', spawn: { x: 1.6, y: 7, facing: 'right' } },
    ],
    encounters: { pool: ['frog', 'cap'], min: 540, max: 860 },
    objects: [
      { type: 'sign', id: 'sign_snow1', x: 6.5, y: 11.6, lines: [
        { text: 'TUYẾT TRO — nơi hơi lạnh đã ở đây lâu hơn cả tro.' },
        { text: 'Dấu chân trên tuyết: của nhiều người, nhưng không ai đi cùng nhau.' },
      ] },
      { type: 'chest', id: 'chest_snow1', x: 3.5, y: 4.6, item: 'kem', count: 1 },
      { type: 'npc', id: 'nguoiTuyet', x: 13.5, y: 9.6, sprite: 'snowman', scale: 2.2, name: 'Người Tuyết', bob: true },
    ],
  },

  snow2: {
    id: 'snow2',
    title: 'LÀNG TUYẾT TRO',
    subtitle: 'đèn trong nhà vẫn sáng cho người lạ',
    theme: 'snow',
    music: 'snow',
    map: [
      '####################',
      '#..................#',
      '#..h.....s....h....#',
      '#..................#',
      '#....g.......g.....#',
      '>..................>',
      '>..................>',
      '#........l.........#',
      '#....v........p....#',
      '#..................#',
      '#..h............h..#',
      '#..................#',
      '#..................#',
      '#..................#',
      '####################',
    ],
    spawn: { x: 2, y: 7, facing: 'right' },
    exits: [
      { x: 0, y: 5, w: 1, h: 2, to: 'snow1', spawn: { x: 18, y: 6, facing: 'left' } },
      { x: 19, y: 5, w: 1, h: 2, to: 'snow3', spawn: { x: 1.6, y: 7, facing: 'right' } },
    ],
    encounters: null,
    objects: [
      { type: 'lamp', id: 'lamp_snow2', x: 9.5, y: 7.6 },
      { type: 'npc', id: 'kem', x: 5.5, y: 4.6, sprite: 'kem', scale: 2.2, name: 'Bác Kem', bob: true, stall: true },
      { type: 'npc', id: 'nguoiTuyet', x: 14.5, y: 10.6, sprite: 'snowman', scale: 2.2, name: 'Người Tuyết', bob: true },
      { type: 'sign', id: 'sign_snow2', x: 3.5, y: 12.6, lines: [
        { text: 'LÀNG TUYẾT TRO — bác Kem bán thứ lạnh nhất nhưng làm ấm nhất.' },
        { text: 'Muốn mua thì nói chuyện với bác, đừng quên chào.' },
      ] },
    ],
  },

  snow3: {
    id: 'snow3',
    title: 'ĐƯỜNG TUẦN TRA',
    subtitle: 'có tiếng thở rất lớn phía sau làn sương',
    theme: 'snow',
    music: 'snow',
    map: [
      '####################',
      '#..................#',
      '#..c...........c...#',
      '#..................#',
      '#....p.....p.......#',
      '>..................>',
      '>..................>',
      '#.....c.....c......#',
      '#..................#',
      '#...p..........p...#',
      '#..................#',
      '#..................#',
      '#........c.........#',
      '#..................#',
      '####################',
    ],
    spawn: { x: 2, y: 7, facing: 'right' },
    exits: [
      { x: 0, y: 5, w: 1, h: 2, to: 'snow2', spawn: { x: 18, y: 6.8, facing: 'left' } },
      {
        x: 19, y: 5, w: 1, h: 2, to: 'forest',
        spawn: { x: 1.6, y: 7, facing: 'right' },
        requires: 'boss_snow',
        blockedText: [
          { text: 'Một trận bão tuyết mỏng quét ngang lối đi.' },
          { text: 'Có gì đó rất lớn đang nằm chắn giữa đường tuần tra.' },
        ],
      },
    ],
    encounters: { pool: ['drek', 'frog', 'cap'], min: 620, max: 920 },
    objects: [
      { type: 'chest', id: 'chest_snow3', x: 16.5, y: 3.6, item: 'kem', count: 2 },
      { type: 'sign', id: 'sign_snow3', x: 4.5, y: 12.6, lines: [
        { text: 'ĐƯỜNG TUẦN TRA — chó giữ đường, chứ không giữ ai.' },
        { text: 'Nó rất thích được vuốt ve. Nếu tay với tới.' },
      ] },
      { type: 'lamp', id: 'lamp_snow3', x: 9.5, y: 12.6 },
      { type: 'boss', id: 'guard', enemy: 'guard', flag: 'boss_snow', x: 10, y: 8.6 },
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
      '>.,,,,,,,wwww,,,,,.>',
      '>..,,,,,,,ww,,,,,,.#',
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
      { x: 0, y: 6, w: 1, h: 2, to: 'snow3', spawn: { x: 18, y: 7, facing: 'left' } },
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
        spawn: { x: 2, y: 7, facing: 'right' },
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
      '>......______.....|#',
      '>......______.....|#',
      '#|.....______.....|#',
      '#|.....______.....|#',
      '#|................|#',
      '#|................|#',
      '#|................|#',
      '#..................#',
      '####################',
    ],
    spawn: { x: 2, y: 7, facing: 'right' },
    exits: [
      { x: 0, y: 6, w: 1, h: 2, to: 'market', spawn: { x: 18, y: 7, facing: 'left' } },
    ],
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
    if (room === 'snow1' || room === 'snow2' || room === 'snow3') {
      return [
        domVoice('Lạnh quá... Tôi là đom đóm, đáng ra phải thích bóng tối, chứ không phải tuyết.'),
        domVoice('Cái làng này có bác Kem. Bán kem giữa trời tuyết — nghe thì vô lý, mà ăn thì tuyệt.'),
        domVoice('Đường tuần tra phía đông có gì đó rất lớn. Tôi nghe tiếng thở từ hôm qua rồi.'),
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
        { speaker: 'Bà Mốc', portrait: 'baMoc', text: flags.boss_bridge_method === 'kill' ? 'Bà không còn nghe tiếng giáo trên cầu nữa. Sự im lặng ấy lạnh quá, cháu à.' : flags.boss_bridge ? 'Người gác cầu đã yên lòng. Bà nghe tiếng giáo của nó gõ xuống cầu — lần đầu tiên nhẹ nhõm như vậy.' : 'Đi đường cẩn thận nhé. Cầu Tro có người gác.' },
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
    return { lines: [{ speaker: 'Nhím', portrait: 'nhim', text: 'Vẫn còn sống à? Tốt. Mua gì thì nói.' }], reward: { openShop: true } };
  },

  kem(ctx) {
    const { flags } = ctx;
    const stock = ['kem', 'candy', 'tea'];
    if (!flags.met_kem) {
      return {
        lines: [
          { speaker: 'Bác Kem', portrait: 'kem', text: 'Ối, khách! Trời tuyết thế này mà cháu đi một mình à? Ngồi xuống đi, bác đãi một que kem.' },
          { speaker: 'Bác Kem', portrait: 'kem', text: 'Bác bán kem quanh năm. Người ta hỏi sao không đợi hè — bác bảo: kem là để chia, không phải để đợi mùa.' },
          { speaker: 'Bác Kem', portrait: 'kem', text: 'Đây, cầm lấy. Muốn mua thêm thì cứ nói với bác.' },
        ],
        reward: { items: { kem: 1 }, flag: 'met_kem', openShop: stock },
      };
    }
    return {
      lines: [
        {
          speaker: 'Bác Kem',
          portrait: 'kem',
          text: flags.boss_snow_method === 'kill'
            ? 'Đường tuần tra im quá. Bác cứ nhìn ra ngoài, chờ cái đuôi trắng quen thuộc ấy.'
            : flags.boss_snow
            ? 'Con chó ngoài kia ngủ rồi à? Tốt quá — nó mà thức là ăn hết kem của bác đấy.'
            : 'Ăn kem đi rồi hãy lên đường. Đường tuần tra lạnh lắm.',
        },
      ],
      reward: { openShop: stock },
    };
  },

  nguoiTuyet(ctx) {
    const { flags } = ctx;
    if (!flags.met_tuyet) {
      return {
        lines: [
          { speaker: 'Người Tuyết', portrait: 'snowman', text: 'Chào... cháu. Bác đứng đây lâu lắm rồi. Tuyết phủ lên bác, rồi thành chính bác.' },
          { speaker: 'Người Tuyết', portrait: 'snowman', text: 'Bác không đi đâu được cả. Nên bác ở lại, đếm xem mùa lạnh này kéo dài bao lâu.' },
          { speaker: 'Người Tuyết', portrait: 'snowman', text: 'À, cháu có biết không: khi trời đủ lạnh, người ta lại gần nhau hơn. Bác nghĩ vậy là đáng.' },
        ],
        reward: { flag: 'met_tuyet', heal: true },
      };
    }
    return {
      lines: [
        {
          speaker: 'Người Tuyết',
          portrait: 'snowman',
          text: flags.boss_snow_method === 'kill'
            ? 'Tuyết hôm nay lạnh hơn. Bác không còn nghe tiếng bước chân trên đường tuần tra.'
            : flags.boss_snow
            ? 'Con chó tuần tra ngủ rồi nhỉ. Bác nghe tiếng ngáy vang khắp đồng tuyết.'
            : 'Đi đường cẩn thận. Chó giữ đường không ác, chỉ là quá to thôi.',
        },
      ],
      reward: {},
    };
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
  guard: [
    { text: 'Đường tuần tra tối dần. Tuyết rơi dày hơn, và mặt đất rung lên theo từng nhịp thở.' },
    { text: 'Một con chó trắng khổng lồ đứng dậy khỏi đám tuyết. Nó không gầm gừ — nó chỉ nhìn bạn.' },
    { speaker: 'Đom', portrait: 'dom', text: 'Nó không chặn đường vì ác... nó chặn vì ở đây chẳng có ai chơi với nó cả.' },
    { text: 'Gợi ý: nó thích được chú ý. Hãy thử NÓI, rồi THA.' },
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
    { text: 'Cầu Tro sáng lên một vệt ấm. Lối sang Tuyết Tro đã mở.' },
  ],
  guard: [
    { text: 'Chó Tuyết Khổng Lồ cào tuyết sang hai bên. Con đường tuần tra hiện ra, sạch sẽ lạ thường.' },
    { speaker: 'Đom', portrait: 'dom', text: 'Nó canh đường này bao lâu rồi nhỉ... chắc cũng chẳng ai nhớ. Ít ra giờ nó ngủ ngon.' },
    { text: 'Lối sang Rừng Tro đã mở.' },
  ],
  king: [
    { speaker: 'Vua Tro', text: '"TA... XIN LỖI. TA CHỈ KHÔNG MUỐN NGỌN LỬA NÀY TẮT TRONG CÔ ĐƠN."' },
    { speaker: 'Đom', portrait: 'dom', text: 'Không ai phải tắt một mình cả. Đó là điều tôi học được từ cậu ấy.' },
  ],
};

export const BOSS_KILL_OUTRO = {
  sentinel: [
    { text: 'Giữa những mảnh sắt vụn, lớp tro chắn lối dần tan đi.' },
    { speaker: 'Đom', portrait: 'dom', text: 'Đường mở rồi... nhưng chẳng còn ai đợi trên cầu nữa.' },
    { text: 'Lối sang Tuyết Tro đã mở.' },
  ],
  guard: [
    { text: 'Tuyết lặng lẽ phủ lên dấu chân khổng lồ. Đường tuần tra không còn người canh.' },
    { speaker: 'Đom', portrait: 'dom', text: 'Tôi cứ nghĩ nó sẽ lại vẫy đuôi.' },
    { text: 'Lối sang Rừng Tro đã mở.' },
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
