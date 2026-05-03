const Footer = () => (
  <footer className="section-shell pb-10">
    <div className="glass-card rounded-[32px] px-6 py-8">
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-display text-2xl font-bold">NammaServe</p>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            A hyperlocal service marketplace inspired by premium booking products, but
            rebuilt around direct communication, local trust, and more affordable jobs.
          </p>
        </div>
        <div>
          <p className="font-semibold">For customers</p>
          <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <p>Verified service options</p>
            <p>Flexible pricing</p>
            <p>Cash or online payment</p>
          </div>
        </div>
        <div>
          <p className="font-semibold">Platform features</p>
          <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <p>Easy service discovery</p>
            <p>Quick communication links</p>
            <p>Transparent booking flow</p>
          </div>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;

