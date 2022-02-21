package gg;

public class JinsiduanMemoryDecorator extends MemoryDecorator {
    BasePC basePC;

    public JinsiduanMemoryDecorator(BasePC basePC) {
        this.basePC = basePC;
    }

    @Override
    public double cost() {
        return basePC.cost() + 1000;
    }

    @Override
    public String getDescript() {
        return basePC.getDescript() + ", jinsiduan";
    }
}
