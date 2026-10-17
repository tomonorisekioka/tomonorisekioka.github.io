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

- 原曲：Georges Bizet、1875年作。
- 実際に使用した歌唱・弦楽器の音符データ：[CostardRouge / system-g — bizet-carmen-toreador.txt](https://github.com/CostardRouge/system-g/blob/main/public/player/scores/bizet-carmen-toreador.txt)。
- このリポジトリの `package.json` は `"license": "MIT"` ですが、確認時に独立した `LICENSE` ファイルは見つからず、**個別の楽譜データがそのライセンスの対象であることは未確認**です。
- フランスの独自音律用に記された音符を平均律のMIDI音高・音価へ変換し、ゲーム用の伴奏を付けています。
- **原典譜を受領（2026-10-17）**：利用者から `IMSLP517383-PMLP15769-Bizet_Carmen_Nr.01_Overture_fs_(etc).pdf` の提供あり。PDFは**583ページ**の総譜全体（先頭150ページだけではない）。『Couplets』（第2幕No.14、エスカミーリョの「闘牛士の歌」）は**PDFの214～227ページ／印刷ページ211～224**。PDFの228ページから次の `RÉCIT` が始まる。
- IMSLPの[ファイルNo.517383](https://imslp.org/wiki/Special:ReverseLookup/517383)は **Choudens初版（1877年頃、plate A.C.3795）の復刻**。1994年Könemann再刊（K 1005）。IMSLP上の表記は **Public Domain**。
- 14ページを抜粋した照合用の譜面を作成（スキャン画像自体は改変しない）。原典の歌唱譜・オーケストレーションの構造と照合可能になった。
- **監査結果：原典入手済み／音符データの完全な独自採譜は未実施。** 現在のゲームには引き続きSystème Gのデータが残っている。原典を入手した事実だけで、そのデータの再利用条件が明確になったとは扱わない。
- 注意：以前のプログラムコメントには、Mutopia Project の **Carmen Prelude（CC BY-SA 2.5）**を音符の直接の出典とする誤記がありました。現在のこの曲のデータは **MutopiaのPrelude譜面を使用していません**。その誤記は修正しました。

## 現状の整理

| 対象 | 原曲の権利 | 参照した楽譜データ | 評価 |
| --- | --- | --- | --- |
| グリーグ『朝』 | 保護期間満了 | Noctave CC0（グリーグ本人のピアノ版） | **置換・確認済み** |
| サティ『ジムノペディ第1番』 | 保護期間満了 | Mutopia: Public Domain | **確認済み** |
| ビゼー『闘牛士の歌』 | 保護期間満了 | Système G採譜データ | **譜面データのライセンス範囲が未確定** |
| ゲーム内の波形合成 | — | Web Audioで新たに合成 | 第三者の録音は使用していない |

以上は出典の監査記録であり、他者の編曲・採譜データに対してユーザーへ再利用権を付与するライセンス文書ではありません。権利者による正式な許諾書でもありません。

参考：日本の著作権保護期間とパブリックドメインの利用については[文化庁](https://www.bunka.go.jp/seisaku/chosakuken/taisetsu/point/index.html)をご参照ください。
