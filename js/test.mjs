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

test();