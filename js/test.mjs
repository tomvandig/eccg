import { MakeComponent, MakeEntity, eccg } from "./eccg.mjs";

function test()
{
    let repo = new eccg();

    let A = MakeEntity("A");
    let B = MakeEntity("B");
    let AB = MakeEntity("A.B");
    let PropA = MakeComponent("Property", "Property");
    let LocationAB = MakeComponent("Location", "Location");
    let LocationB = MakeComponent("Geometry", "Geometry");

    repo.Compose(A, PropA);
    repo.Compose(B, LocationB);
    repo.Compose(A, B);
    repo.Compose(AB, LocationAB);

    console.log(repo.Query(A));
    console.log(repo.Query(B));
    console.log(repo.Query(AB));

    console.log(repo.Query(MakeEntity("A.*")));
    console.log(repo.Query(MakeEntity("B.*")));
    console.log(repo.Query(MakeEntity("A.B.*")));
}

function test2()
{
    let repo = new eccg();

    let A = MakeEntity("A");
    let B = MakeEntity("B");
    let C = MakeEntity("C");

    let PropA = MakeComponent("Property", "PropertyA");
    let PropB = MakeComponent("Property", "PropertyB");
    let PropC = MakeComponent("Property", "PropertyC");

    repo.Compose(A, PropA);
    repo.Compose(B, PropB);
    repo.Compose(C, PropC);

    repo.Compose(A, B);
    repo.Compose(B, C);

    console.log(repo.Query(MakeEntity("A.*")));
    console.log(repo.Query(MakeEntity("A.B.*")));
    console.log(repo.Query(MakeEntity("A.B.C.*")));
}

function test3()
{
    let repo = new eccg();

    let A = MakeEntity("A");
    let B = MakeEntity("B");
    let C = MakeEntity("C");
    let D = MakeEntity("D");

    let PropC = MakeComponent("Property", "PropertyC");

    repo.Compose(C, PropC);

    repo.Compose(A, B);
    repo.Compose(B, C);
    repo.Compose(D, B);

    console.log(repo.Query(MakeComponent("Property")));
}

function testaec()
{
    let repo = new eccg();

    let SpaceHeater1 = MakeEntity("SpaceHeater1");
    let SpaceHeater2 = MakeEntity("SpaceHeater2");
    let ConvectionHeater = MakeEntity("ConvectionHeater");
    let EnergyTransferArchetype = MakeEntity("EnergyTransferArchetype");

    let Name1 = MakeComponent("Name", "SpaceHeater1");
    let Name2 = MakeComponent("Name", "SpaceHeater2");
    let HeatingCoefficient = MakeComponent("HeatingCoefficient", "default: 382 mg/s");
    let HeatingCoefficientOverride = MakeComponent("HeatingCoefficient", "overridden: 235 mg/s");

    repo.Compose(EnergyTransferArchetype, HeatingCoefficient);
    repo.Compose(SpaceHeater1, Name1);
    repo.Compose(SpaceHeater2, Name2);
    repo.Compose(MakeEntity("SpaceHeater1.ConvectionHeater.EnergyTransferArchetype"), HeatingCoefficientOverride);

    repo.Compose(SpaceHeater1, ConvectionHeater);
    repo.Compose(SpaceHeater2, ConvectionHeater);
    repo.Compose(ConvectionHeater, EnergyTransferArchetype);

    console.log(repo.Query(MakeComponent("HeatingCoefficient")));
    console.log(repo.Query(MakeEntity("SpaceHeater1.*")));
    console.log(repo.Query(MakeEntity("SpaceHeater1.ConvectionHeater.EnergyTransferArchetype.*")));
    console.log(repo.Query(MakeEntity("SpaceHeater2.ConvectionHeater.EnergyTransferArchetype.*")));
}

testaec();