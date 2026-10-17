# BGMの出典・利用条件（2026-10-17 確認）

このページは、`game.html` のクラシック曲8bitアレンジについて、**原曲の著作権**と**参照した現代の編曲・採譜データの利用条件**を分けて記録するものです。

## 共通事項

- 対象作曲家：Edvard Grieg（1907年没）、Erik Satie（1925年没）、Georges Bizet（1875年没）。
- 日本での原曲の著作権保護期間は、いずれも満了しています。原曲を新たに演奏・編曲すること自体は原則可能です。
- このサイトではブラウザの Web Audio API により波形を生成します。商用録音、配信音源、市販MIDI、既存の録音サンプルは使用していません。
- **原曲がパブリックドメインであっても、独立に創作された現代の編曲は別の権利を持つことがあります。** この区別は必須です。

## 追加資料の受領・版の確認（2026-10-17）

- ユーザーが提供したPDF：`IMSLP579108-PMLP2533-Grieg_Edvard_Peer_Gynt_Suite_No_1_by_DigitalScores(1).pdf`
- 42ページ。『朝』（Morgenstimmung）は**PDFの4–18ページ**、続いて組曲の残りの楽章。
- PDFのメタデータは **DigitalScores / 2019年6月27日**。1888年の原典譜を撮影した画像ではなく、現代の浄書版。
- IMSLPの **ファイルNo.579108** の登録ライセンスは **CC BY-NC 4.0**。原曲のパブリックドメイン状態と、この版の表示ライセンスを混同しない。
- 目的は権利の曖昧さの解消なので、**このDigitalScores版は音符データの置換元として採用しない**。比較参照だけに留める。
- 出典を置換する場合の候補：
  - [IMSLP #810456](https://imslp.org/wiki/Peer_Gynt_Suite_No.1,_Op.46_(Grieg,_Edvard)) — 1888年1月20日付の自筆総譜（Public Domain）
  - 同ページ **#912194 / #521719** — 1888年Peters初版の復刻総譜（Public Domain）
  - [Sibley Music Library](https://urresearch.rochester.edu/institutionalPublicationPublicView.action?institutionalItemVersionId=16183) — 歴史的Peters版のピアノ連弾譜（Public Domainとして公開）
- **2026-10-17に置換実施**：Noctave配布の `grieg-au-matin.mxl`（CC0 1.0）から87小節を抽出し、以前のDiethart Stecher編曲に基づく音符データを除去した。

## 1. グリーグ『朝』 / Morning Mood

- 原曲：Edvard Grieg — *Peer Gynt*。著作権保護期間満了。
- **現在の使用音符データ**：[Noctave — Au matin (Peer Gynt)](https://noctavepiano.com/en/sheet-music/grieg-au-matin/) の `grieg-au-matin.mxl`。2026年10月11日作成。MXL内部の `rights` 要素に **CC0 1.0** と明記されている。
- Noctaveの情報によれば、原資料はグリーグ本人によるピアノ版の1900年G. Schirmer刊（plate 14300、Louis Oesterle編）で、[当時の出版物のスキャン](https://archive.org/details/31761045200615)に基づく。
- **2026-10-17置換**：87小節の両手パートから、音高・音価・休符・タイ・和音・短い装飾音をプログラムで抽出し `game-morning-cc0.js` に収録。低音の一部を小型スピーカー向けにオクターブ移動し、Web Audioの矩形波などで独自演奏。テンポはMXLの指定に合わせ、約174秒。
- 過去に参照した **Diethart Stecherによる2025年の室内楽編曲の音符データは、現在のコードから除去**。楽曲の既存録音・商用音源・市販MIDIは使用していない。
- **監査結果：音符データをCC0の公開譜面に移行済み。** グリーグ本人の原曲の著作権も満了しており、当該MXLに関する不明な現代編曲の権利懸念は解消。

## 2. サティ『ジムノペディ第1番』 / Gymnopédie No. 1

- 原曲：Erik Satie、1888年作。
- 出典：[Mutopia Project — LilyPond譜](https://github.com/MutopiaProject/MutopiaProject/blob/master/ftp/SatieE/gymnopedie_1/gymnopedie_1.ly)、入力者 **Evin Robertson**。
- ソースの `license` フィールドは **`Public Domain`**。原典はパブリックドメイン版に基づくと明記。
- このゲームでは両手パートの音符・伴奏・反復・2つの結末を抽出して独自の電子音で演奏。
- **監査結果：利用条件は明確。** 出典と入力者へのリンクを継続掲載します。

## 3. ビゼー『カルメン：闘牛士の歌』 / Toreador Song

- 原曲：Georges Bizet、1875年作。保護期間満了。
- **2026-10-17 の新しい音符データ**：PDMX（Long et al., 2024、データセット [Zenodo DOI:10.5281/zenodo.15571083](https://zenodo.org/records/15571083)、CC BY 4.0）を由来とする22トラックのオーケストラMIDI。実際の音符データは以下の[公開GitHubミラー](https://github.com/Johaan01/flyback-midi/blob/main/musicas/classicos/Fran%C3%A7a/Bizet%20(G.)/Carmen%20-%20Toreador%20Song.mid)から取得。
- ミラーの[creditos.json](https://github.com/Johaan01/flyback-midi/blob/main/musicas/classicos/creditos.json) は `Carmen - Toreador Song.mid` を **CC0** と表示。元の譜面制作者は **marty strasinger**、[MuseScoreの対象スコア](https://musescore.com/user/340306/scores/2274466) を出典としている。
- MIDI検証：22トラック、480 ticks/quarter、テンポ変更36件、10,556個のNoteOn、約318.24秒。エスカミーリョ歌唱トラックは521音を収録。ゲーム用にエスカミーリョ、ヴァイオリン第1、チェロ、コントラバス、トロンボーン、フラスキータ、テノール合唱の7パートから3,051音を抽出。テンポ変更、発音時刻・音価を保持し、Web Audioで独自8bit合成。既存の録音は不使用。
- この新しい演奏用データは `game-carmen-pdmx.js`、再生側の参照は `game-music-data.js`。**従来のSystème Gによる採譜配列は完全に削除済み**。
- ユーザー提供の歴史的原典：[IMSLP File 517383](https://imslp.org/wiki/Special:ReverseLookup/517383)、PDF pp.214–227 の「Couplets」。音楽史的・譜面照合用資料として保持。かつて取り組んだ独自採譜の進捗は[研究メモ](research/carmen-original-score-progress.md)参照。
- **権利について残る留保**：PDMXでは公開ライセンスと楽譜ファイル内部のライセンスに不一致がある事例があり、公式は `no_license_conflict` の利用を推奨している。**今回の特定スコアが同サブセットに含まれるかはまだ確認できていない**。従ってミラーのCC0表示を根拠に実装したが、「完全に権利監査済み」とは表示しない。PDMXデータセットの帰属は継続して明示する。

## 現状の整理

| 対象 | 原曲の権利 | 参照した楽譜データ | 評価 |
| --- | --- | --- | --- |
| グリーグ『朝』 | 保護期間満了 | Noctave CC0（グリーグ本人のピアノ版） | **置換・確認済み** |
| サティ『ジムノペディ第1番』 | 保護期間満了 | Mutopia: Public Domain | **確認済み** |
| ビゼー『闘牛士の歌』 | 保護期間満了 | PDMX由来MIDI、ミラーはCC0表示 | **置換済み・個別ライセンス不一致の有無は未検証** |
| ゲーム内の波形合成 | — | Web Audioで新たに合成 | 第三者の録音は使用していない |

以上は出典の監査記録であり、他者の編曲・採譜データに対してユーザーへ再利用権を付与するライセンス文書ではありません。権利者による正式な許諾書でもありません。

参考：日本の著作権保護期間とパブリックドメインの利用については[文化庁](https://www.bunka.go.jp/seisaku/chosakuken/taisetsu/point/index.html)をご参照ください。
