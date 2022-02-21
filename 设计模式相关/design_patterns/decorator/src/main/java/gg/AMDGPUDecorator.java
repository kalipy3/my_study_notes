package gg;

public class AMDGPUDecorator extends GPUDecorator {
    BasePC basePC;

    public AMDGPUDecorator(BasePC basePC) {
        this.basePC = basePC;
    }

    @Override
    public double cost() {
        return basePC.cost() + 12000;
    }

    @Override
    public String getDescript() {
        return basePC.getDescript() + ", AMDGPU";
    }
}
