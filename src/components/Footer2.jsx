import "../css/Footer2.css";

function Footer2() {
  return (
    <footer className="footer2">

      <div className="footer2-left">

        <a href="#">TOU</a>
        <a href="#">Privacy</a>
        <a href="#">Community</a>
        <a href="#">Help</a>

      </div>

      <div className="footer2-right">

        <div className="language-dropdown">

          <span className="language-selected">
            Português ▾
          </span>

          <div className="language-menu">

            <a href="#">Português</a>
            <a href="#">English</a>
            <a href="#">Español</a>
            <a href="#">Français</a>
            <a href="#">Deutsch</a>
            <a href="#">Italiano</a>
            <a href="#">日本語</a>
            <a href="#">한국어</a>
            <a href="#">中文</a>
            <a href="#">Русский</a>
            <a href="#">العربية</a>
            <a href="#">Türkçe</a>
            <a href="#">हिन्दी</a>

          </div>

        </div>

      </div>

    </footer>
  );
}

export default Footer2;