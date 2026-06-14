from signalflow.ingestion.snr import SNRScorer


def test_score_simple():
    scorer = SNRScorer()
    text = "def foo():\n    return 1\n\nclass Bar:\n    pass\n"
    score = scorer.score_text(text)
    assert score > 0
